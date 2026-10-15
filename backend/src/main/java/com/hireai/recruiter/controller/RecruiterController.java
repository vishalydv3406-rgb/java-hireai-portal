package com.hireai.recruiter.controller;

import com.hireai.recruiter.dto.RecruiterDtos;
import com.hireai.recruiter.service.RecruiterService;
import com.hireai.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiter/profile")
@RequiredArgsConstructor
@Tag(name = "Recruiter Profile", description = "Recruiter profile management endpoints")
public class RecruiterController {

    private final RecruiterService recruiterService;

    @GetMapping
    @Operation(summary = "Get currently authenticated recruiter's profile")
    public ResponseEntity<RecruiterDtos.RecruiterProfileResponse> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recruiterService.getProfile(user));
    }

    @PutMapping
    @Operation(summary = "Update currently authenticated recruiter's profile")
    public ResponseEntity<RecruiterDtos.RecruiterProfileResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody RecruiterDtos.UpdateRecruiterProfileRequest request) {
        return ResponseEntity.ok(recruiterService.updateProfile(user, request));
    }
}
