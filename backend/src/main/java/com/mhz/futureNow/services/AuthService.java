package com.mhz.futureNow.services;

import com.mhz.futureNow.dto.SignupRequest;
import com.mhz.futureNow.dto.UserDto;
import com.mhz.futureNow.dto.UsersDto;
import com.mhz.futureNow.entity.User;

import java.util.Optional;

public interface AuthService {
    UserDto createCustomer(SignupRequest signupRequest);
    Optional<UsersDto> getUserById(Long id);
    Optional<UsersDto> updateUser(Long id, User updatedUser);
}
