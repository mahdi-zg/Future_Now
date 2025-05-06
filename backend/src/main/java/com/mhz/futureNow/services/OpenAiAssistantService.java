package com.mhz.futureNow.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class OpenAiAssistantService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    public String createAssistant(String name, String instructions) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("name", name);
            requestBody.put("instructions", instructions);
            requestBody.put("model", "gpt-4-turbo");

            String jsonBody = mapper.writeValueAsString(requestBody);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/assistants"))
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .header("OpenAI-Beta", "assistants=v2")
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200 && response.statusCode() != 201) {
                throw new RuntimeException("❌ Assistant creation failed: " + response.body());
            }

            JsonNode json = mapper.readTree(response.body());
            JsonNode idNode = json.get("id");
            if (idNode == null) {
                throw new RuntimeException("❌ No assistant ID returned. Response: " + response.body());
            }

            return idNode.asText();
        } catch (Exception e) {
            throw new RuntimeException("❌ Failed to create assistant", e);
        }
    }

}
