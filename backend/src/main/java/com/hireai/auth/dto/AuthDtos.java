package com.hireai.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
        @NotBlank @Email(message = "Must be a valid email address")
        String email,

        @NotBlank
        @Size(min = 8, max = 100, message = "Password must be 8–100 characters")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#]).{8,}$",
            message = "Password must contain uppercase, lowercase, digit, and special character"
        )
        String password,

        @NotBlank
        @Size(min = 2, max = 200, message = "Full name must be 2–200 characters")
        String fullName,

        @NotBlank
        @Pattern(regexp = "CANDIDATE|RECRUITER", message = "Role must be CANDIDATE or RECRUITER")
        String role
    ) {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserInfo user
    ) {
        public static AuthResponse of(String access, String refresh, long expiresIn, UserInfo user) {
            return new AuthResponse(access, refresh, "Bearer", expiresIn, user);
        }
    }

    public record UserInfo(
        String id,
        String email,
        String role,
        String fullName
    ) {}

    public record RefreshRequest(
        @NotBlank String refreshToken
    ) {}

    public record PasswordResetRequest(
        @NotBlank @Email String email
    ) {}

    public record PasswordResetConfirmRequest(
        @NotBlank String token,

        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#]).{8,}$",
            message = "Password must contain uppercase, lowercase, digit, and special character"
        )
        String newPassword
    ) {}
}
