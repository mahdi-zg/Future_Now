package com.mhz.futureNow.dto;

import com.mhz.futureNow.entity.BrainType;
import lombok.Data;

@Data
public class ProjectRequestDTO {
    private String name;
    private String function;
    private String description;
    private String nativeLanguage;
    private String companyName;
    private BrainType brainType;
    private String instructions;
    private String voice;
    private String logo; // ✅ Ajout du champ pour stocker le chemin de l'avatar sélectionné
    private String colorBackground; // ✅ Ajout de la couleur


    private int calmness;
    private int curiosity;
    private int enthusiasm;
    private int formality;
    private int introversion;
    private int responseSpeed;
    private int seriousness;
}