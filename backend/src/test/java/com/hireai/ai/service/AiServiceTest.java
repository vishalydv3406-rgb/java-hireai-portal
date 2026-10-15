package com.hireai.ai.service;

import com.hireai.ai.dto.AiDtos;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiServiceTest {

    private final AiService aiService = new AiService();

    @Test
    @DisplayName("Should detect matching skills and compute match score between resume and job")
    void matchResumeToJob_ComputesAccurateOverlap() {
        String resume = "Experienced Java backend developer with strong Spring Boot, PostgreSQL, Docker, and REST API experience.";
        String jobTitle = "Senior Java Engineer";
        String jobDesc = "Looking for a Java developer proficient in Spring Boot, PostgreSQL, Redis, and Kubernetes.";

        AiDtos.MatchResultResponse result = aiService.matchResumeToJob(resume, jobTitle, jobDesc);

        assertThat(result).isNotNull();
        assertThat(result.overallMatchScore()).isNotNull();
        assertThat(result.overallMatchScore().doubleValue()).isGreaterThan(50.0);

        assertThat(result.matchedSkills()).contains("Java", "Spring Boot", "PostgreSQL");
        assertThat(result.missingSkills()).contains("Redis", "Kubernetes");
        assertThat(result.fitSummary()).isNotEmpty();
    }

    @Test
    @DisplayName("Should generate structured interview prep questions tailored to role")
    void generateInterviewPrep_GeneratesTargetedQuestions() {
        String resume = "Java, Spring Boot, Microservices, CI/CD.";
        String jobTitle = "Full-Stack Engineer";
        String jobDesc = "Building high-performance scalable web systems.";

        AiDtos.InterviewPrepResponse response = aiService.generateInterviewPrep(resume, jobTitle, jobDesc);

        assertThat(response).isNotNull();
        assertThat(response.questions()).isNotEmpty();
        assertThat(response.questions()).anyMatch(q -> q.category().contains("Technical"));
        assertThat(response.preparationChecklist()).isNotEmpty();
    }
}
