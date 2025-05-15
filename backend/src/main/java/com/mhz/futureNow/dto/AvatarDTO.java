package com.mhz.futureNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AvatarDTO {
    private String name;
    private String function;
    private String logo; // ex: "assets/doctor.png"
    private String colorBackground;
    private Long projectId; // 🔥 AJOUTÉ

}
