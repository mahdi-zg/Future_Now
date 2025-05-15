package com.mhz.futureNow.services.chat;


import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.speech.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.*;

@Service
public class SttService {

    private final Path uploadsDir = Paths.get("uploads");
    private final GoogleCredentials credentials;
    private final SpeechSettings settings;

    public SttService() throws IOException {
        if (!Files.exists(uploadsDir)) Files.createDirectories(uploadsDir);
        System.out.println("📦 GOOGLE CREDENTIALS FOUND? " + Files.exists(Paths.get("/app/config/google-credentials.json")));

        this.credentials = GoogleCredentials.fromStream(
                new FileInputStream("/app/config/google-credentials.json")
        );
        this.settings = SpeechSettings.newBuilder()
                .setCredentialsProvider(() -> credentials)
                .build();
    }

    public String speechToTextOpenAI(MultipartFile file) throws Exception {
        System.out.println("🎤 [STT Service] Début du traitement STT");
        long start = System.currentTimeMillis();

        Path inputWebm = uploadsDir.resolve("audio.webm");
        Path outputWav = uploadsDir.resolve("audio.wav");
        file.transferTo(inputWebm);

        ProcessBuilder pb = new ProcessBuilder("ffmpeg", "-y",
                "-i", inputWebm.toString(), "-ac", "1", "-ar", "16000", outputWav.toString());
        pb.redirectError(ProcessBuilder.Redirect.DISCARD);
        pb.redirectOutput(ProcessBuilder.Redirect.DISCARD);
        int exitCode = pb.start().waitFor();
        if (exitCode != 0) throw new RuntimeException("FFmpeg conversion failed");

        try (SpeechClient speechClient = SpeechClient.create(settings)) {
            ByteString audioBytes = ByteString.readFrom(Files.newInputStream(outputWav));

            RecognitionConfig config = RecognitionConfig.newBuilder()
                    .setEncoding(RecognitionConfig.AudioEncoding.LINEAR16)
                    .setSampleRateHertz(16000)
                    .setLanguageCode("en-US")
                    .build();

            RecognitionAudio audio = RecognitionAudio.newBuilder().setContent(audioBytes).build();
            RecognizeResponse response = speechClient.recognize(config, audio);

            StringBuilder resultText = new StringBuilder();
            for (SpeechRecognitionResult result : response.getResultsList()) {
                SpeechRecognitionAlternative alternative = result.getAlternativesList().get(0);
                resultText.append(alternative.getTranscript()).append(" ");
            }

            long end = System.currentTimeMillis();
            System.out.println("✅ [STT Service] Fini en " + (end - start) + " ms");
            return resultText.toString().trim();
        }
    }
}
