package com.hireai.job.dto;

import com.hireai.job.entity.Job;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class JobDtos {

    // ── Request DTOs ─────────────────────────────────────────────────

    public record CreateJobRequest(
        @NotBlank @Size(max = 300) String title,
        @NotBlank String description,
        String responsibilities,
        String requirements,
        String benefits,
        @NotNull Job.EmploymentType employmentType,
        @Size(max = 300) String location,
        Job.RemoteType remoteType,
        @Min(0) @Max(50) Integer minExperienceYears,
        @Min(0) @Max(50) Integer maxExperienceYears,
        @DecimalMin("0") BigDecimal salaryMin,
        @DecimalMin("0") BigDecimal salaryMax,
        String salaryCurrency,
        Instant closesAt,
        List<SkillRef> requiredSkills,
        List<SkillRef> preferredSkills
    ) {}

    public record SkillRef(
        @NotNull UUID skillId,
        boolean required
    ) {}

    public record UpdateJobRequest(
        @Size(max = 300) String title,
        String description,
        String responsibilities,
        String requirements,
        String benefits,
        Job.EmploymentType employmentType,
        String location,
        Job.RemoteType remoteType,
        Integer minExperienceYears,
        Integer maxExperienceYears,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String salaryCurrency,
        Instant closesAt
    ) {}

    public record JobSearchRequest(
        String keyword,
        String location,
        Job.EmploymentType employmentType,
        Job.RemoteType remoteType,
        Integer minExperience,
        Integer maxExperience,
        BigDecimal salaryMin,
        UUID companyId
    ) {}

    // ── Response DTOs ─────────────────────────────────────────────────

    public record JobSummaryResponse(
        UUID id,
        String title,
        CompanyInfo company,
        String location,
        Job.EmploymentType employmentType,
        Job.RemoteType remoteType,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String salaryCurrency,
        Integer minExperienceYears,
        Job.JobStatus status,
        Instant publishedAt,
        int applicationsCount,
        List<String> requiredSkills
    ) {}

    public record JobDetailResponse(
        UUID id,
        String title,
        CompanyInfo company,
        String description,
        String responsibilities,
        String requirements,
        String benefits,
        String location,
        Job.EmploymentType employmentType,
        Job.RemoteType remoteType,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String salaryCurrency,
        Integer minExperienceYears,
        Integer maxExperienceYears,
        Job.JobStatus status,
        Instant publishedAt,
        Instant closesAt,
        int viewsCount,
        int applicationsCount,
        List<SkillDetail> requiredSkills,
        List<SkillDetail> preferredSkills
    ) {}

    public record CompanyInfo(
        UUID id,
        String name,
        String slug,
        String logoUrl,
        String industry,
        String headquarters,
        Company.VerificationStatus verificationStatus
    ) {}

    public record SkillDetail(UUID id, String name, String category, boolean required) {}

    // Nested enum reference (same as Company entity)
    public interface Company {
        enum VerificationStatus { PENDING, VERIFIED, REJECTED }
    }
}
