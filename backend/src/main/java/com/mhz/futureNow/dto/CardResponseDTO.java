package com.mhz.futureNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CardResponseDTO {
    private Long id;
    private String title;
    private String prompt;
    private String tags;
    private String imagePath;
    private Long projectId;
}
