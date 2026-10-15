package com.hireai.ai.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class AiDtos {

    public record MatchRequest(
            UUID resumeId,
            String resumeText,
            UUID jobId,
            String jobTitle,
            String jobDescription
    ) {}

    public record MatchResultResponse(
            BigDecimal overallMatchScore,
            BigDecimal skillsMatchScore,
            BigDecimal experienceMatchScore,
            List<String> matchedSkills,
            List<String> missingSkills,
            List<String> strengths,
            List<String> recommendations,
            String fitSummary
    ) {}

    public record InterviewPrepRequest(
            UUID resumeId,
            String resumeText,
            @NotBlank String jobTitle,
            String jobDescription
    ) {}

    public record InterviewQuestion(
            String category,
            String question,
            String context,
            String tips
    ) {}

    public record InterviewPrepResponse(
            String jobTitle,
            List<InterviewQuestion> questions,
            List<String> preparationChecklist
    ) {}

    public record ParseResumeResponse(
            String candidateName,
            String email,
            String phone,
            String headline,
            List<String> detectedSkills,
            BigDecimal estimatedExperienceYears,
            List<String> summaryPoints
    ) {}
}
