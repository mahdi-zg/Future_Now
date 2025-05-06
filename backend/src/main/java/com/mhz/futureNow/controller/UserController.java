package com.mhz.futureNow.controller;

import com.mhz.futureNow.dto.ProjectRequestDTO;
import com.mhz.futureNow.dto.ProjectResponseDTO;
import com.mhz.futureNow.dto.UsersDto;
import com.mhz.futureNow.entity.Project;
import com.mhz.futureNow.entity.User;
import com.mhz.futureNow.services.AuthServiceImpl;
import com.mhz.futureNow.services.ProjectService;
import com.mhz.futureNow.services.jwt.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final AuthServiceImpl userService;
    private final ProjectService projectService;


    // 🔹 Récupérer les informations utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<UsersDto> getUserById(@PathVariable Long id) {
        Optional<UsersDto> userDTO = userService.getUserById(id);
        return userDTO.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔹 Mettre à jour les informations utilisateur (DTO)
    @PutMapping("/{id}")
    public ResponseEntity<UsersDto> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<UsersDto> updatedUserDTO = userService.updateUser(id, updatedUser);
        return updatedUserDTO.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔹 Création d'un projet
    @PostMapping("/createProject/{userId}")
    public ResponseEntity<Project> createProject(@PathVariable Long userId, @RequestBody ProjectRequestDTO projectDTO) {
        Project newProject = projectService.createProject(projectDTO, userId);
        return ResponseEntity.ok(newProject);
    }

    @GetMapping("/getProject/{id}")
    public ProjectResponseDTO getProject(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    @GetMapping("/getProjects/{userId}")
    public List<ProjectResponseDTO> getProjectsByUser(@PathVariable Long userId) {
        return projectService.getProjectsByUserId(userId);
    }

    @DeleteMapping("/deleteProject/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Projet supprimé avec succès."); // ✅ JSON valide
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Erreur lors de la suppression du projet"));
        }
    }
    @PutMapping("/updateProject/{projectId}")
    public ResponseEntity<Project> updateProject(@PathVariable Long projectId, @RequestBody ProjectRequestDTO projectDTO) {
        Project updatedProject = projectService.updateProject(projectId, projectDTO);
        return ResponseEntity.ok(updatedProject);
    }

}