package com.hireai.candidate.controller;

import com.hireai.candidate.dto.CandidateDtos;
import com.hireai.candidate.service.CandidateService;
import com.hireai.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/candidate/profile")
@RequiredArgsConstructor
@Tag(name = "Candidate Profile", description = "Candidate profile management endpoints")
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    @Operation(summary = "Get currently authenticated candidate's profile")
    public ResponseEntity<CandidateDtos.CandidateProfileResponse> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(candidateService.getProfile(user));
    }

    @PutMapping
    @Operation(summary = "Update currently authenticated candidate's profile")
    public ResponseEntity<CandidateDtos.CandidateProfileResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CandidateDtos.UpdateCandidateProfileRequest request) {
        return ResponseEntity.ok(candidateService.updateProfile(user, request));
    }
}
