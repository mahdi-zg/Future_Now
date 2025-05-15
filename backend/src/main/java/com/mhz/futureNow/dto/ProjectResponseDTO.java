package com.mhz.futureNow.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class ProjectResponseDTO {
    private Long id;
    private String name;
    private String function;
    private String description;
    private String nativeLanguage;
    private String companyName;
    private String prompt;
    private String voice;
    private Long userId;
    private String logo;
    private String instructions;
    private String colorBackground; // ✅ DOIT venir avant
    private String brainType;       // ✅ DOIT venir après

    public ProjectResponseDTO(Long id, String name, String function, String description,
                              String nativeLanguage, String companyName, String prompt,
                              String voice, Long userId, String logo,
                              String instructions, String colorBackground, String brainType) {
        this.id = id;
        this.name = name;
        this.function = function;
        this.description = description;
        this.nativeLanguage = nativeLanguage;
        this.companyName = companyName;
        this.prompt = prompt;
        this.voice = voice;
        this.userId = userId;
        this.logo = logo;
        this.instructions = instructions;
        this.colorBackground = colorBackground;
        this.brainType = brainType;
    }
}

