package com.mhz.futureNow.controller;

import com.mhz.futureNow.dto.CardDTO;
import com.mhz.futureNow.dto.CardResponseDTO;
import com.mhz.futureNow.entity.Card;
import com.mhz.futureNow.entity.Project;
import com.mhz.futureNow.services.jwt.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CardController {

    private final CardService cardService;

    @PostMapping("/project/{projectId}")
    public ResponseEntity<List<CardResponseDTO>> addCards(@PathVariable Long projectId,
                                                          @RequestBody List<CardDTO> cardDTOs) {
        return ResponseEntity.ok(cardService.addCardsToProject(projectId, cardDTOs));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<CardResponseDTO>> getCards(@PathVariable Long projectId) {
        return ResponseEntity.ok(cardService.getCardsByProject(projectId));
    }


    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long cardId) {
        cardService.deleteCard(cardId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload/{projectId}")
    public ResponseEntity<CardResponseDTO> uploadCard(
            @PathVariable Long projectId,
            @RequestParam("title") String title,
            @RequestParam("prompt") String prompt,
            @RequestParam("tags") String tags,
            @RequestParam("file") MultipartFile file) {

        try {
            Card card = new Card();
            card.setTitle(title);
            card.setPrompt(prompt);
            card.setTags(tags);
            card.setProject(new Project());
            card.getProject().setId(projectId);

            card.setImageData(file.getBytes());

            Card savedCard = cardService.saveCard(card); // 🛑 Attention on doit ajouter `saveCard()` dans le service
            return ResponseEntity.ok(cardService.toDTO(savedCard));
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du traitement de l'image", e);
        }
    }

}