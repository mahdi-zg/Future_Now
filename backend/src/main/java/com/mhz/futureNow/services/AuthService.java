package com.mhz.futureNow.services;

import com.mhz.futureNow.dto.SignupRequest;
import com.mhz.futureNow.dto.UserDto;

public interface AuthService {
    UserDto createCustomer(SignupRequest signupRequest);
}
