package com.hireai.application.dto;

import com.hireai.application.entity.Application;
import com.hireai.job.dto.JobDtos;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class ApplicationDtos {

    public record ApplyJobRequest(
            @NotNull UUID jobId,
            UUID resumeId,
            String coverLetter
    ) {}

    public record UpdateStatusRequest(
            @NotNull Application.ApplicationStatus status,
            String notes
    ) {}

    public record ApplicationSummaryResponse(
            UUID id,
            UUID jobId,
            String jobTitle,
            String companyName,
            String companyLogoUrl,
            UUID candidateId,
            String candidateName,
            String candidateEmail,
            UUID resumeId,
            String resumeFilename,
            Application.ApplicationStatus status,
            BigDecimal matchScore,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record ApplicationDetailResponse(
            UUID id,
            JobDtos.JobSummaryResponse job,
            CandidateSummary candidate,
            ResumeSummary resume,
            Application.ApplicationStatus status,
            String coverLetter,
            BigDecimal matchScore,
            String notes,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record CandidateSummary(
            UUID id,
            String fullName,
            String email,
            String headline,
            String location,
            BigDecimal totalExperienceYears
    ) {}

    public record ResumeSummary(
            UUID id,
            String filename,
            String originalFilename,
            String contentType
    ) {}
}
