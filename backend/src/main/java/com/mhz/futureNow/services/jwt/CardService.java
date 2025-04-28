package com.mhz.futureNow.services.jwt;

import com.mhz.futureNow.dto.CardDTO;
import com.mhz.futureNow.dto.CardResponseDTO;
import com.mhz.futureNow.entity.Card;
import com.mhz.futureNow.entity.Project;
import com.mhz.futureNow.repository.CardRepository;
import com.mhz.futureNow.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final ProjectRepository projectRepository;

    public List<CardResponseDTO> addCardsToProject(Long projectId, List<CardDTO> cardDTOs) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<Card> cards = cardDTOs.stream().map(dto -> {
            Card card = new Card();
            card.setTitle(dto.getTitle());
            card.setPrompt(dto.getPrompt());
            card.setTags(dto.getTags());
            if (dto.getImageData() != null) {
                card.setImageData(Base64.getDecoder().decode(dto.getImageData()));
            }
            card.setProject(project);
            return card;
        }).toList();

        return cardRepository.saveAll(cards).stream().map(this::toDTO).toList();
    }

    public List<CardResponseDTO> getCardsByProject(Long projectId) {
        List<Card> cards = cardRepository.findByProjectId(projectId);
        return cards.stream().map(this::toDTO).toList();
    }

    public CardResponseDTO updateCard(Long cardId, CardDTO cardDTO) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        card.setTitle(cardDTO.getTitle());
        card.setPrompt(cardDTO.getPrompt());
        card.setTags(cardDTO.getTags());
        if (cardDTO.getImageData() != null) {
            card.setImageData(Base64.getDecoder().decode(cardDTO.getImageData()));
        }
        return toDTO(cardRepository.save(card));
    }

    public void deleteCard(Long cardId) {
        if (!cardRepository.existsById(cardId)) {
            throw new RuntimeException("Card not found");
        }
        cardRepository.deleteById(cardId);
    }

    public Card saveCard(Card card) {
        return cardRepository.save(card);
    }

    public CardResponseDTO toDTO(Card card) {
        String base64Image = null;
        if (card.getImageData() != null) {
            base64Image = Base64.getEncoder().encodeToString(card.getImageData());
        }
        return new CardResponseDTO(
                card.getId(),
                card.getTitle(),
                card.getPrompt(),
                card.getTags(),
                base64Image, // ✅ pas card.getImageData() directement
                card.getProject().getId()
        );
    }




}