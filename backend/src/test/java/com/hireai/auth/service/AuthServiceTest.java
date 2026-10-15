package com.hireai.auth.service;

import com.hireai.auth.dto.AuthDtos;
import com.hireai.auth.entity.RefreshToken;
import com.hireai.auth.repository.RefreshTokenRepository;
import com.hireai.candidate.repository.CandidateProfileRepository;
import com.hireai.common.exception.ConflictException;
import com.hireai.recruiter.repository.RecruiterProfileRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private CandidateProfileRepository candidateProfileRepository;
    @Mock
    private RecruiterProfileRepository recruiterProfileRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User candidateUser;

    @BeforeEach
    void setUp() {
        candidateUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@hireai.dev")
                .passwordHash("encoded_pwd")
                .role(User.Role.CANDIDATE)
                .status(User.AccountStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should successfully register candidate and return tokens")
    void registerCandidate_Success() {
        AuthDtos.RegisterRequest request = new AuthDtos.RegisterRequest(
                "test@hireai.dev",
                "Password123!",
                User.Role.CANDIDATE,
                "Alex Doe",
                null
        );

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded_pwd");
        when(userRepository.save(any(User.class))).thenReturn(candidateUser);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token_123");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh_token_123");
        when(jwtService.getRefreshTokenExpiryMs()).thenReturn(604800000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(mock(RefreshToken.class));

        AuthDtos.AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("access_token_123");
        assertThat(response.refreshToken()).isEqualTo("refresh_token_123");
        assertThat(response.email()).isEqualTo(candidateUser.getEmail());

        verify(userRepository).save(any(User.class));
        verify(candidateProfileRepository).save(any());
    }

    @Test
    @DisplayName("Should throw ConflictException when email is already registered")
    void register_EmailAlreadyExists() {
        AuthDtos.RegisterRequest request = new AuthDtos.RegisterRequest(
                "existing@hireai.dev",
                "Password123!",
                User.Role.CANDIDATE,
                "Alex Doe",
                null
        );

        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
    }
}
