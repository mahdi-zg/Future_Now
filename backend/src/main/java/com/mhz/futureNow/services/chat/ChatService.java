package com.mhz.futureNow.services.chat;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mhz.futureNow.dto.ProjectResponseDTO;
import com.mhz.futureNow.services.ProjectService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;
@Service
public class ChatService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Path audiosDir = Paths.get("audios");
    private final ProjectService projectService;

    public ChatService(RestTemplate restTemplate, ProjectService projectService) {
        this.restTemplate = restTemplate;
        this.projectService = projectService;
        try {
            if (!Files.exists(audiosDir)) {
                Files.createDirectories(audiosDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create audios directory", e);
        }
    }
    private Map<String, Object> callOpenAiAssistantV2(String assistantId, String userMessage, Long projectId) throws Exception {
        // 🔹 Créer un thread
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.add("OpenAI-Beta", "assistants=v2");
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> threadRequest = new HashMap<>();
        HttpEntity<Map<String, Object>> threadEntity = new HttpEntity<>(threadRequest, headers);
        ResponseEntity<String> threadResponse = restTemplate.postForEntity("https://api.openai.com/v1/threads", threadEntity, String.class);
        String threadId = new ObjectMapper().readTree(threadResponse.getBody()).get("id").asText();

        // 🔹 Ajouter le message dans le thread
        Map<String, String> msgBody = Map.of("role", "user", "content", userMessage);
        HttpEntity<Map<String, String>> msgEntity = new HttpEntity<>(msgBody, headers);
        restTemplate.postForEntity("https://api.openai.com/v1/threads/" + threadId + "/messages", msgEntity, String.class);

        // 🔹 Lancer le run
        Map<String, String> runBody = Map.of("assistant_id", assistantId);
        HttpEntity<Map<String, String>> runEntity = new HttpEntity<>(runBody, headers);
        ResponseEntity<String> runResponse = restTemplate.postForEntity("https://api.openai.com/v1/threads/" + threadId + "/runs", runEntity, String.class);
        String runId = new ObjectMapper().readTree(runResponse.getBody()).get("id").asText();

        // 🔄 Attendre que le run se termine
        String status = "queued";
        while (!status.equals("completed")) {
            Thread.sleep(1000);
            HttpEntity<Void> getRunEntity = new HttpEntity<>(headers);
            ResponseEntity<String> runStatusResp = restTemplate.exchange(
                    "https://api.openai.com/v1/threads/" + threadId + "/runs/" + runId,
                    HttpMethod.GET,
                    getRunEntity,
                    String.class
            );
            status = new ObjectMapper().readTree(runStatusResp.getBody()).get("status").asText();
        }

        HttpEntity<Void> getMessagesEntity = new HttpEntity<>(headers);
        ResponseEntity<String> messagesResp = restTemplate.exchange(
                "https://api.openai.com/v1/threads/" + threadId + "/messages",
                HttpMethod.GET,
                getMessagesEntity,
                String.class
        );
        String responseText = new ObjectMapper().readTree(messagesResp.getBody())
                .get("data").get(0).get("content").get(0).get("text").get("value").asText();

        // ✅ Vérifier si c’est un tableau JSON stringifié ou un simple texte
        List<Map<String, Object>> parsedMessages;
        try {
            parsedMessages = mapper.readValue(responseText, new TypeReference<>() {});
        } catch (Exception e) {
            parsedMessages = List.of(Map.of(
                    "text", responseText,
                    "facialExpression", "smile",
                    "animation", "Talking"
            ));
        }

        // 🔊 Générer audio + lipsync
        List<Map<String, Object>> finalMessages = new ArrayList<>();
        for (int i = 0; i < parsedMessages.size(); i++) {
            Map<String, Object> msg = parsedMessages.get(i);
            String text = (String) msg.get("text");

            Path mp3 = audiosDir.resolve("message_" + i + ".mp3");
            Path wav = audiosDir.resolve("message_" + i + ".wav");
            Path json = audiosDir.resolve("message_" + i + ".json");

            generateTTS(text, mp3, projectId);
            runFfmpeg(mp3, wav);
            runRhubarb(wav, json);

            msg.put("audio", base64Encode(mp3));
            msg.put("lipsync", readJson(json));

            finalMessages.add(msg);
        }

        Map<String, Object> finalResponse = new HashMap<>();
        finalResponse.put("messages", finalMessages);
        return finalResponse;
    }


    public Map<String, Object> processChat(String userMessage, Long projectId) throws Exception {
        ProjectResponseDTO project = projectService.getProjectById(projectId);

        // 🔁 Choix du mode : Assistant V2 ou GPT classique
        if (project.getBrainType().equalsIgnoreCase("ASSISTANT")) {
            if (project.getAssistantId() == null || project.getAssistantId().isEmpty()) {
                throw new RuntimeException("❌ Assistant ID manquant pour ce projet.");
            }
            return callOpenAiAssistantV2(project.getAssistantId(), userMessage, projectId);
        }

        // 🔁 Sinon, GPT classique
        String dynamicPrompt = project.getPrompt();
        List<Map<String, Object>> messages = callChatGPT(userMessage, dynamicPrompt);

        // 🔊 TTS + lipsync
        List<CompletableFuture<Void>> tasks = new ArrayList<>();
        for (int i = 0; i < messages.size(); i++) {
            int index = i;
            tasks.add(CompletableFuture.runAsync(() -> {
                try {
                    Map<String, Object> msg = messages.get(index);
                    String text = (String) msg.getOrDefault("text", "Hello");

                    Path mp3Path = audiosDir.resolve("message_" + index + ".mp3");
                    Path wavPath = audiosDir.resolve("message_" + index + ".wav");
                    Path jsonPath = audiosDir.resolve("message_" + index + ".json");

                    generateTTS(text, mp3Path, projectId);
                    runFfmpeg(mp3Path, wavPath);
                    runRhubarb(wavPath, jsonPath);

                    String base64Audio = base64Encode(mp3Path);
                    Map<String, Object> lipsyncData = readJson(jsonPath);

                    msg.put("audio", base64Audio);
                    msg.put("lipsync", lipsyncData);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }));
        }

        CompletableFuture.allOf(tasks.toArray(new CompletableFuture[0])).join();

        Map<String, Object> result = new HashMap<>();
        result.put("messages", messages);
        return result;
    }


    public List<Map<String, Object>> callChatGPT(String userMessage, String prompt) throws IOException {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo-1106");
        requestBody.put("max_tokens", 500);
        requestBody.put("temperature", 0.3);

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", prompt);
        messages.add(systemMsg);

        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = "https://api.openai.com/v1/chat/completions";
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("ChatGPT request failed: " + response.getStatusCode());
        }

        JsonNode root = mapper.readTree(response.getBody());
        String content = root.path("choices").get(0).path("message").path("content").asText("");
        content = content.replaceAll("```json", "").replaceAll("```", "").trim();

        try {
            return mapper.readValue(content, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("text", "Sorry, there was an error processing your request.");
            fallback.put("facialExpression", "serious");
            fallback.put("animation", "Idle");
            return Collections.singletonList(fallback);
        }
    }

    private void generateTTS(String text, Path mp3Path, Long projectId) throws Exception {
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("model", "tts-1");
        // 🔄 Récupérer la voix préférée du projet
        String voice = projectService.getProjectById(projectId).getVoice();
        requestBody.put("voice", voice != null ? voice : "alloy"); // fallback en alloy si null

        requestBody.put("input", text);
        String jsonBody = mapper.writeValueAsString(requestBody);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
        String url = "https://api.openai.com/v1/audio/speech";
        ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, entity, byte[].class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("TTS request failed: " + response.getStatusCode());
        }
        Files.write(mp3Path, Objects.requireNonNull(response.getBody()));
    }

    private void runFfmpeg(Path mp3File, Path wavFile) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("ffmpeg", "-y", "-i", mp3File.toString(), "-ac", "1", "-ar", "16000", wavFile.toString());
        pb.inheritIO();
        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0) throw new RuntimeException("FFmpeg failed with exit code " + exitCode);
    }

    private void runRhubarb(Path wavFile, Path jsonFile) throws Exception {
        Path rhubarbExe = Paths.get("bin", "rhubarb");
        ProcessBuilder pb = new ProcessBuilder(
                rhubarbExe.toAbsolutePath().toString(),
                "-f", "json",
                "-o", jsonFile.toString(),
                wavFile.toString(),
                "-r", "phonetic"
        );
        pb.inheritIO();
        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0) throw new RuntimeException("Rhubarb failed with exit code " + exitCode);
    }

    private String base64Encode(Path filePath) throws Exception {
        byte[] fileBytes = Files.readAllBytes(filePath);
        return Base64.getEncoder().encodeToString(fileBytes);
    }

    private Map<String, Object> readJson(Path jsonFile) throws Exception {
        if (!Files.exists(jsonFile)) return Collections.emptyMap();
        String content = new String(Files.readAllBytes(jsonFile), StandardCharsets.UTF_8);
        return mapper.readValue(content, new TypeReference<Map<String, Object>>() {});
    }
}
