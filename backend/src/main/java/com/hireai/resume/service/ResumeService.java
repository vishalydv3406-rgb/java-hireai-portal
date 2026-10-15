package com.hireai.resume.service;

import com.hireai.candidate.entity.CandidateProfile;
import com.hireai.candidate.repository.CandidateProfileRepository;
import com.hireai.common.exception.BusinessException;
import com.hireai.common.exception.ResourceNotFoundException;
import com.hireai.resume.dto.ResumeDtos;
import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;
import com.hireai.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final ResumeRepository resumeRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final StorageService storageService;
    private final ResumeTextExtractor textExtractor;

    @Transactional
    public ResumeDtos.ResumeResponse uploadResume(MultipartFile file, String label, boolean makePrimary, User user) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Uploaded file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size exceeds maximum limit of 10MB");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            // Check file extension as fallback
            String origName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            if (!origName.endsWith(".pdf") && !origName.endsWith(".docx") && !origName.endsWith(".doc") && !origName.endsWith(".txt")) {
                throw new BusinessException("Unsupported file type. Only PDF and DOCX files are permitted.");
            }
        }

        CandidateProfile candidate = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Candidate profile not found for user: " + user.getEmail()));

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (Exception e) {
            throw new BusinessException("Failed to read uploaded file: " + e.getMessage());
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        String storageKey = candidate.getId() + "/" + UUID.randomUUID() + "_" + originalFilename.replaceAll("\\s+", "_");

        // Save to storage
        storageService.store(storageKey, bytes, contentType != null ? contentType : "application/pdf");

        // Extract text via Tika
        String extractedText = textExtractor.extractText(bytes, originalFilename);

        if (makePrimary) {
            resumeRepository.clearPrimaryForCandidate(candidate.getId());
        }

        Resume resume = Resume.builder()
                .candidate(candidate)
                .filename(originalFilename)
                .originalFilename(originalFilename)
                .storageKey(storageKey)
                .contentType(contentType != null ? contentType : "application/pdf")
                .fileSizeBytes(file.getSize())
                .processingStatus(extractedText.isBlank() ? Resume.ProcessingStatus.FAILED : Resume.ProcessingStatus.COMPLETED)
                .extractedText(extractedText)
                .primary(makePrimary)
                .label(label != null && !label.isBlank() ? label : "Default Resume")
                .build();

        Resume saved = resumeRepository.save(resume);
        log.info("Resume saved: id={}, candidate={}, size={}", saved.getId(), candidate.getId(), saved.getFileSizeBytes());
        return toSummaryResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ResumeDtos.ResumeResponse> getCandidateResumes(User user) {
        CandidateProfile candidate = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Candidate profile not found"));
        return resumeRepository.findByCandidateIdOrderByCreatedAtDesc(candidate.getId())
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResumeDtos.ResumeDetailResponse getResumeDetail(UUID resumeId, User user) {
        Resume resume = getAndValidateResume(resumeId, user);
        return toDetailResponse(resume);
    }

    @Transactional
    public void setPrimaryResume(UUID resumeId, User user) {
        Resume resume = getAndValidateResume(resumeId, user);
        resumeRepository.clearPrimaryForCandidate(resume.getCandidate().getId());
        resume.setPrimary(true);
        resumeRepository.save(resume);
    }

    @Transactional
    public void deleteResume(UUID resumeId, User user) {
        Resume resume = getAndValidateResume(resumeId, user);
        storageService.delete(resume.getStorageKey());
        resumeRepository.delete(resume);
        log.info("Resume deleted: id={}, user={}", resumeId, user.getId());
    }

    public InputStream getResumeStream(UUID resumeId, User user) {
        Resume resume = getAndValidateResume(resumeId, user);
        return storageService.load(resume.getStorageKey());
    }

    private Resume getAndValidateResume(UUID resumeId, User user) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        if (user.getRole() == User.Role.CANDIDATE) {
            CandidateProfile candidate = candidateProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BusinessException("Candidate profile not found"));
            if (!resume.getCandidate().getId().equals(candidate.getId())) {
                throw new BusinessException("Access denied to resume: " + resumeId);
            }
        }
        return resume;
    }

    private ResumeDtos.ResumeResponse toSummaryResponse(Resume r) {
        String snippet = "";
        if (r.getExtractedText() != null && !r.getExtractedText().isBlank()) {
            snippet = r.getExtractedText().length() > 200
                    ? r.getExtractedText().substring(0, 200) + "..."
                    : r.getExtractedText();
        }
        return new ResumeDtos.ResumeResponse(
                r.getId(),
                r.getCandidate().getId(),
                r.getFilename(),
                r.getOriginalFilename(),
                r.getContentType(),
                r.getFileSizeBytes(),
                r.getProcessingStatus(),
                snippet,
                r.isPrimary(),
                r.getLabel(),
                r.getCreatedAt()
        );
    }

    private ResumeDtos.ResumeDetailResponse toDetailResponse(Resume r) {
        return new ResumeDtos.ResumeDetailResponse(
                r.getId(),
                r.getCandidate().getId(),
                r.getFilename(),
                r.getOriginalFilename(),
                r.getContentType(),
                r.getFileSizeBytes(),
                r.getProcessingStatus(),
                r.getExtractedText(),
                r.getProcessingError(),
                r.isPrimary(),
                r.getLabel(),
                r.getCreatedAt()
        );
    }
}
