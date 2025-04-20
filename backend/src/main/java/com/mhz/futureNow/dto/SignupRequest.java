package com.mhz.futureNow.dto;

import lombok.*;

@Data
public class SignupRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
}
