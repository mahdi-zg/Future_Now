package com.mhz.futureNow.dto;

import lombok.Data;

@Data
public class AuthenticationResponse {
    private String jwt;
    private String userRole;
    private Long userId;
}
