package com.hireai.recruiter.dto;

import com.hireai.company.dto.CompanyDtos;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class RecruiterDtos {

    public record UpdateRecruiterProfileRequest(
            @NotBlank @Size(max = 200) String fullName,
            @Size(max = 200) String title,
            @Size(max = 50) String phone,
            @Size(max = 500) String linkedinUrl,
            UUID companyId
    ) {}

    public record RecruiterProfileResponse(
            UUID id,
            UUID userId,
            String email,
            String fullName,
            String title,
            String phone,
            String linkedinUrl,
            CompanyDtos.CompanyResponse company,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
