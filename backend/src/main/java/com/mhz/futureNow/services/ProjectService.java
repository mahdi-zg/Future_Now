package com.mhz.futureNow.services;


import com.mhz.futureNow.dto.ProjectRequestDTO;
import com.mhz.futureNow.dto.ProjectResponseDTO;
import com.mhz.futureNow.entity.Project;
import com.mhz.futureNow.entity.User;
import com.mhz.futureNow.repository.ProjectRepository;
import com.mhz.futureNow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, RestTemplate restTemplate) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    public Project createProject(ProjectRequestDTO projectRequestDTO, Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé !");
        }
        User user = userOptional.get();

        // 🔹 Générer le prompt automatiquement
        String generatedPrompt = generatePrompt(projectRequestDTO);

        Project project = new Project();
        project.setName(projectRequestDTO.getName());
        project.setFunction(projectRequestDTO.getFunction());
        project.setDescription(projectRequestDTO.getDescription());
        project.setCompanyName(projectRequestDTO.getCompanyName());
        project.setNativeLanguage(projectRequestDTO.getNativeLanguage());
        project.setBrainType(projectRequestDTO.getBrainType());
        project.setLogo(projectRequestDTO.getLogo()); // ✅ Stocke le chemin de l'avatar
        project.setInstructions(projectRequestDTO.getInstructions());
        project.setVoice(projectRequestDTO.getVoice());
        project.setPrompt(generatedPrompt); // ✅ Stockage du prompt généré
        project.setColorBackground(projectRequestDTO.getColorBackground()); // ✅ Stockage de la couleur
        project.setUser(user);

        return projectRepository.save(project);
    }
    private String generatePrompt(ProjectRequestDTO projectDTO) {
        String gender = detectGender(projectDTO.getLogo());
        String name = projectDTO.getName();
        String function = projectDTO.getFunction();
        String language = projectDTO.getNativeLanguage() != null && !projectDTO.getNativeLanguage().isEmpty()
                ? projectDTO.getNativeLanguage()
                : "English";

        return "You are a " + gender + " " + function.toLowerCase() + " named " + name + ". Reply with JSON array.\n" +
                "Each message should be short (max 20 words per message).\n" +
                "If the response is long, break it into multiple short messages.\n" +
                "Each message includes: text, facialExpression (smile, serious, thoughtful), animation (Idle, Talking-1, Talking).\n" +
                "Your communication style must reflect the following attributes:\n" +
                "Formality: " + projectDTO.getFormality() + "%, " +
                "Curiosity: " + projectDTO.getCuriosity() + "%, " +
                "Serenity: " + projectDTO.getCalmness() + "%, " +
                "and Enthusiasm: " + projectDTO.getEnthusiasm() + "%.\n" +
                "Be clear, structured, and supportive in your explanations.\n" +
                "Always ask engaging follow-up questions to maintain active conversation.\n" +
                "Always respond in " + language + ", no matter the input language.\n" +
                "No additional text or comments outside the JSON format.";
    }



    private String detectGender(String logoPath) {
        if (logoPath == null) return "neutral";
        String filename = logoPath.toLowerCase();
        return (filename.contains("madame") || filename.contains("teacher")
                || filename.contains("frau") || filename.contains("sophie")
                || filename.contains("lili")) ? "female" : "male";
    }


    public ProjectResponseDTO getProjectById(Long projectId) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            throw new RuntimeException("Projet non trouvé");
        }

        Project project = projectOpt.get();

        return new ProjectResponseDTO(
                project.getId(),
                project.getName(),
                project.getFunction(),
                project.getDescription(),
                project.getNativeLanguage(),
                project.getCompanyName(),
                project.getPrompt(),
                project.getVoice(),
                project.getUser().getId(),
                project.getLogo(),
                project.getInstructions(),
                project.getColorBackground(),
                project.getBrainType().name()
        );
    }

    public List<ProjectResponseDTO> getProjectsByUserId(Long userId) {
        List<Project> projects = projectRepository.findByUserId(userId);

        return projects.stream().map(project -> new ProjectResponseDTO(
                project.getId(),
                project.getName(),
                project.getFunction(),
                project.getDescription(),
                project.getNativeLanguage(),
                project.getCompanyName(),
                project.getPrompt(),
                project.getVoice(),
                project.getUser().getId(),
                project.getLogo(),
                project.getInstructions(),  // ✅ Ajout des instructions
                project.getColorBackground(),
                project.getBrainType().name()     // ✅ Ajout du brainType
        )).collect(Collectors.toList());
    }

    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException("Projet introuvable avec l'ID : " + projectId);
        }
        projectRepository.deleteById(projectId);
    }

    public Project updateProject(Long projectId, ProjectRequestDTO projectDTO) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            throw new RuntimeException("Projet non trouvé !");
        }

        Project project = projectOpt.get();

        // ✅ Mise à jour des champs
        if (projectDTO.getName() != null) project.setName(projectDTO.getName());
        if (projectDTO.getFunction() != null) project.setFunction(projectDTO.getFunction());
        if (projectDTO.getDescription() != null) project.setDescription(projectDTO.getDescription());
        if (projectDTO.getCompanyName() != null) project.setCompanyName(projectDTO.getCompanyName());
        if (projectDTO.getNativeLanguage() != null) project.setNativeLanguage(projectDTO.getNativeLanguage());
        if (projectDTO.getBrainType() != null) project.setBrainType(projectDTO.getBrainType());
        if (projectDTO.getLogo() != null) project.setLogo(projectDTO.getLogo());
        if (projectDTO.getInstructions() != null) project.setInstructions(projectDTO.getInstructions());
        if (projectDTO.getVoice() != null) project.setVoice(projectDTO.getVoice());
        if (projectDTO.getColorBackground() != null) project.setColorBackground(projectDTO.getColorBackground());

        // ✅ Toujours régénérer le prompt automatiquement
        String updatedPrompt = generatePrompt(projectDTO);
        project.setPrompt(updatedPrompt);

        return projectRepository.save(project);
    }


}