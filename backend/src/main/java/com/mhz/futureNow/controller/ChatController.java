package com.mhz.futureNow.controller;

import com.mhz.futureNow.services.chat.ChatService;
import com.mhz.futureNow.services.chat.SttService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class ChatController {

    private final SttService sttService;
    private final ChatService chatService;

    @Autowired
    public ChatController(SttService sttService, ChatService chatService) {
        this.sttService = sttService;
        this.chatService = chatService;
    }

    @GetMapping("/")
    public ResponseEntity<String> helloWorld() {
        return ResponseEntity.ok("Hello from Spring Boot!");
    }

    @PostMapping("/stt/{projectId}")
    public ResponseEntity<?> handleStt(
            @PathVariable Long projectId,
            @RequestParam("audio") MultipartFile file) {
        long start = System.currentTimeMillis();
        System.out.println("🎤 [STT Controller] Fichier audio reçu pour projet ID: " + projectId);

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("No audio file uploaded");
            }

            String transcription = sttService.speechToTextOpenAI(file);
            long end = System.currentTimeMillis();
            System.out.println("✅ [STT Controller] Fini en " + (end - start) + " ms");

            return ResponseEntity.ok(Collections.singletonMap("text", transcription));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur dans la conversion vocale.");
        }
    }

    @PostMapping("/chat/{projectId}")
    public ResponseEntity<?> handleChat(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> body) {
        long start = System.currentTimeMillis();
        System.out.println("💬 [CHAT Controller] Message reçu pour projet ID: " + projectId);

        try {
            String userMessage = (String) body.getOrDefault("message", "");
            Map<String, Object> response = chatService.processChat(userMessage, projectId);

            long end = System.currentTimeMillis();
            System.out.println("✅ [CHAT Controller] Réponse retournée en " + (end - start) + " ms");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du traitement du message.");
        }
    }
}
