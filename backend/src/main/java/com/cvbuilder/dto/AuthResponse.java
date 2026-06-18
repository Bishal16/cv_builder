package com.cvbuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private UserDetailsDto user;
    /** When true, the client must verify via OTP before a session is issued (token is null). */
    private boolean emailVerificationRequired;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDetailsDto {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private boolean emailVerified;
    }
}
