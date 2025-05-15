package com.mhz.futureNow.services;


import com.mhz.futureNow.dto.ProjectRequestDTO;
import com.mhz.futureNow.dto.SignupRequest;
import com.mhz.futureNow.dto.UserDto;
import com.mhz.futureNow.dto.UsersDto;
import com.mhz.futureNow.entity.BrainType;
import com.mhz.futureNow.entity.User;
import com.mhz.futureNow.entity.UserRole;
import com.mhz.futureNow.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final ProjectService projectService;

    @PostConstruct
    public void createAdminAccount() {
        User adminAccount = userRepository.findByUserRole(UserRole.SUPER_ADMIN);

        if (adminAccount == null) {
            User newAdminAccount = new User();
            newAdminAccount.setFirstName("Admin");
            newAdminAccount.setLastName("Account");
            newAdminAccount.setEmail("admin@test.com");
            newAdminAccount.setPassword(new BCryptPasswordEncoder().encode("admin"));
            newAdminAccount.setUserRole(UserRole.SUPER_ADMIN);
            userRepository.save(newAdminAccount);
            System.out.println("Admin account created successfully");
        }
    }

    @Override
    public UserDto createCustomer(SignupRequest signupRequest) {
        User user = new User();
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(new BCryptPasswordEncoder().encode(signupRequest.getPassword()));
        user.setUserRole(UserRole.USER);

        User createdUser = userRepository.save(user);
        // 🔥 Créer un projet par défaut pour ce nouvel utilisateur
        ProjectRequestDTO defaultProject = new ProjectRequestDTO();
        defaultProject.setName("My First AI");
        defaultProject.setFunction("Virtual Assistant");
        defaultProject.setDescription("Default project created on signup");
        defaultProject.setCompanyName("Default Company");
        defaultProject.setNativeLanguage("English");
        defaultProject.setBrainType(BrainType.CHATGPT); // à adapter selon ton enum
        defaultProject.setLogo("assets/doctor.png"); // logo par défaut
        defaultProject.setInstructions("Feel free to ask anything!");
        defaultProject.setVoice("nova"); // une voix féminine par défaut
        defaultProject.setColorBackground("#0a1f44"); // fond blanc
        defaultProject.setCalmness(5);
        defaultProject.setCuriosity(5);
        defaultProject.setEnthusiasm(5);
        defaultProject.setFormality(5);
        defaultProject.setIntroversion(5);
        defaultProject.setResponseSpeed(5);
        defaultProject.setSeriousness(5);

        projectService.createProject(defaultProject, createdUser.getId());
        UserDto userDto = new UserDto();
        userDto.setId(createdUser.getId());
        return userDto;
    }
    private UsersDto convertToDTO(User user) {
        return new UsersDto(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getUserRole().name(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getCodePostal(),
                user.getPays()
        );
    }
    // 🔹 Récupérer les informations utilisateur par ID
    public Optional<UsersDto> getUserById(Long id) {
        return userRepository.findById(id).map(this::convertToDTO);
    }

    // 🔹 Mettre à jour les informations utilisateur par ID
    public Optional<UsersDto> updateUser(Long id, User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setFirstName(updatedUser.getFirstName());
                    user.setLastName(updatedUser.getLastName());
                    user.setPhoneNumber(updatedUser.getPhoneNumber());
                    user.setAddress(updatedUser.getAddress());
                    user.setCodePostal(updatedUser.getCodePostal());
                    user.setPays(updatedUser.getPays());
                    userRepository.save(user);
                    return convertToDTO(user);
                });
    }
}

