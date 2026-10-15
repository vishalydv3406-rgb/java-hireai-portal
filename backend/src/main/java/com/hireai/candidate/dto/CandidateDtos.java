package com.hireai.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class CandidateDtos {

    public record UpdateCandidateProfileRequest(
            @NotBlank @Size(max = 200) String fullName,
            @Size(max = 200) String headline,
            @Size(max = 200) String location,
            String about,
            @Size(max = 50) String phone,
            @Size(max = 500) String linkedinUrl,
            @Size(max = 500) String githubUrl,
            @Size(max = 500) String portfolioUrl,
            String preferredLocations,
            String employmentTypePref,
            Boolean openToWork,
            BigDecimal totalExperienceYears
    ) {}

    public record CandidateProfileResponse(
            UUID id,
            UUID userId,
            String email,
            String fullName,
            String headline,
            String location,
            String about,
            String phone,
            String linkedinUrl,
            String githubUrl,
            String portfolioUrl,
            String preferredLocations,
            String employmentTypePref,
            boolean openToWork,
            BigDecimal totalExperienceYears,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
