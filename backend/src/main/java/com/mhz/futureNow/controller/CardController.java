package com.mhz.futureNow.controller;

import com.mhz.futureNow.dto.CardDTO;
import com.mhz.futureNow.dto.CardResponseDTO;
import com.mhz.futureNow.entity.Card;
import com.mhz.futureNow.services.jwt.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}