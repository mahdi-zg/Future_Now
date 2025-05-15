package com.mhz.futureNow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String prompt;
    private String tags;
    private String imagePath; // 🔥 Chemin de l'image (ex: assets/cards/image1.png)

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonIgnore // ⛔ Empêche la boucle infinie quand on renvoie la Card
    private Project project;
}