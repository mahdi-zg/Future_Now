package com.mhz.futureNow.controller;

import com.mhz.futureNow.dto.AuthenticationRequest;
import com.mhz.futureNow.dto.AuthenticationResponse;
import com.mhz.futureNow.dto.SignupRequest;
import com.mhz.futureNow.dto.UserDto;
import com.mhz.futureNow.entity.User;
import com.mhz.futureNow.repository.UserRepository;
import com.mhz.futureNow.services.AuthService;
import com.mhz.futureNow.services.jwt.UserService;
import com.mhz.futureNow.utils.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;


    @PostMapping("/signup")
    public ResponseEntity<?> signupCustomer(@RequestBody SignupRequest signupRequest) {
        UserDto createdCustomerDto = authService.createCustomer(signupRequest);

        if (createdCustomerDto == null) {
            return new ResponseEntity<>(
                    "Customer not created, Come again later", HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(createdCustomerDto, HttpStatus.CREATED);
    }
    @PostMapping("/login")
    public AuthenticationResponse createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) throws
            BadCredentialsException,
            DisabledException,
            UsernameNotFoundException {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authenticationRequest.getEmail(),
                            authenticationRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Incorrect username or password.");
        }

        final UserDetails userDetails = userService.userDetailsService()
                .loadUserByUsername(authenticationRequest.getEmail());

        Optional<User> optionalUser = userRepository.findFirstByEmail(userDetails.getUsername());

        final String jwt = jwtUtil.generateToken(userDetails);

        AuthenticationResponse authenticationResponse = new AuthenticationResponse();

        if (optionalUser.isPresent()) {
            authenticationResponse.setJwt(jwt);
            authenticationResponse.setUserId(optionalUser.get().getId());
            authenticationResponse.setUserRole(String.valueOf(optionalUser.get().getUserRole()));
        }

        return authenticationResponse;
    }

}
