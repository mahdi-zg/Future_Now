package com.mhz.futureNow.dto;

import lombok.Data;

@Data
public class CardDTO {
    private String title;
    private String prompt;
    private String tags;
    private String imagePath;
}
