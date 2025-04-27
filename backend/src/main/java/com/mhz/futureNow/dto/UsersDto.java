package com.mhz.futureNow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsersDto {
    private String firstName;
    private String lastName;
    private String email;
    private String userRole;
    private Integer phoneNumber;
    private String address;
    private String codePostal;
    private String pays;
}
