package com.mhz.futureNow.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(name = "fonction")  // <-- corrige ici
    private String function;
    private String description;
    private String nativeLanguage;
    private String companyName;
    private String colorBackground;  // ✅ Ajout de colorBackground

    @Lob  // ✅ Permet de stocker de longs textes
    @Column(columnDefinition = "TEXT")  // ✅ Spécifie que la colonne est de type TEXT en SQL
    private String prompt;

    private String previewImage;
    private String logo;
    private String watermark;

    private BrainType brainType;
    private String instructions;
    private String knowledges;
    private String connections;

    private String caractere;
    private boolean welcome;
    private boolean welcomeMessage;
    private int maxResponseLength;
    private String googleVoiceApiKey;
    private String voice;

    private RenderMode renderMode;
    private boolean showCards;
    private String weblink;
    private String widgetLink;
    private String kioskCode;
    private String kioskSdk;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<Card> cards = new ArrayList<>();

}