package com.hireai.auth.service;

import com.hireai.auth.dto.AuthDtos;
import com.hireai.auth.entity.RefreshToken;
import com.hireai.auth.repository.RefreshTokenRepository;
import com.hireai.candidate.entity.CandidateProfile;
import com.hireai.candidate.repository.CandidateProfileRepository;
import com.hireai.common.exception.BusinessException;
import com.hireai.common.exception.ResourceNotFoundException;
import com.hireai.recruiter.entity.RecruiterProfile;
import com.hireai.recruiter.repository.RecruiterProfileRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${hireai.jwt.refresh-token-expiry-ms:604800000}")
    private long refreshTokenExpiryMs;

    @Value("${hireai.jwt.access-token-expiry-ms:900000}")
    private long accessTokenExpiryMs;

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessException("EMAIL_TAKEN", "An account with this email already exists");
        }

        User.Role role = User.Role.valueOf(request.role());

        User user = User.builder()
            .email(request.email().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.password()))
            .role(role)
            .status(User.AccountStatus.ACTIVE)
            .emailVerified(true) // simplified for V1; enable verification flow for prod
            .build();

        user = userRepository.save(user);

        // Create role-specific profile stub
        if (role == User.Role.CANDIDATE) {
            CandidateProfile profile = CandidateProfile.builder()
                .user(user)
                .fullName(request.fullName())
                .build();
            candidateProfileRepository.save(profile);
        } else if (role == User.Role.RECRUITER) {
            RecruiterProfile profile = RecruiterProfile.builder()
                .user(user)
                .fullName(request.fullName())
                .build();
            recruiterProfileRepository.save(profile);
        }

        log.info("New user registered: id={} role={}", user.getId(), role);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new ResourceNotFoundException("User", request.email()));

        userRepository.updateLastLogin(user.getId(), Instant.now());
        log.info("User logged in: id={}", user.getId());

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDtos.AuthResponse refresh(AuthDtos.RefreshRequest request) {
        String tokenHash = hashToken(request.refreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new BusinessException("INVALID_TOKEN", "Invalid or expired refresh token"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            // Revoke all tokens for this user (token reuse detection)
            refreshTokenRepository.revokeAllByUserId(stored.getUser().getId());
            throw new BusinessException("TOKEN_REUSE", "Refresh token has been invalidated. Please log in again.");
        }

        // Rotate: revoke old, issue new
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = stored.getUser();
        log.info("Refresh token rotated for user: id={}", user.getId());
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        String tokenHash = hashToken(refreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    // ── Private helpers ───────────────────────────────────────────────

    private AuthDtos.AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .tokenHash(hashToken(rawRefreshToken))
            .expiresAt(Instant.now().plusMillis(refreshTokenExpiryMs))
            .revoked(false)
            .build();
        refreshTokenRepository.save(refreshToken);

        String fullName = resolveFullName(user);

        return AuthDtos.AuthResponse.of(
            accessToken,
            rawRefreshToken,
            accessTokenExpiryMs / 1000,
            new AuthDtos.UserInfo(user.getId().toString(), user.getEmail(),
                user.getRole().name(), fullName)
        );
    }

    private String resolveFullName(User user) {
        return switch (user.getRole()) {
            case CANDIDATE -> candidateProfileRepository.findByUserId(user.getId())
                .map(CandidateProfile::getFullName).orElse("");
            case RECRUITER -> recruiterProfileRepository.findByUserId(user.getId())
                .map(RecruiterProfile::getFullName).orElse("");
            case ADMIN -> "Administrator";
        };
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
