package com.hireai.resume.dto;

import com.hireai.resume.entity.Resume;

import java.time.Instant;
import java.util.UUID;

public class ResumeDtos {

    public record ResumeResponse(
            UUID id,
            UUID candidateId,
            String filename,
            String originalFilename,
            String contentType,
            long fileSizeBytes,
            Resume.ProcessingStatus processingStatus,
            String extractedTextSnippet,
            boolean isPrimary,
            String label,
            Instant createdAt
    ) {}

    public record ResumeDetailResponse(
            UUID id,
            UUID candidateId,
            String filename,
            String originalFilename,
            String contentType,
            long fileSizeBytes,
            Resume.ProcessingStatus processingStatus,
            String extractedText,
            String processingError,
            boolean isPrimary,
            String label,
            Instant createdAt
    ) {}
}
