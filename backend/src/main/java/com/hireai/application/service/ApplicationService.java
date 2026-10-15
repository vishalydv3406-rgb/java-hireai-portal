package com.hireai.application.service;

import com.hireai.ai.dto.AiDtos;
import com.hireai.ai.service.AiService;
import com.hireai.application.dto.ApplicationDtos;
import com.hireai.application.entity.Application;
import com.hireai.application.repository.ApplicationRepository;
import com.hireai.candidate.entity.CandidateProfile;
import com.hireai.candidate.repository.CandidateProfileRepository;
import com.hireai.common.exception.BusinessException;
import com.hireai.common.exception.ConflictException;
import com.hireai.common.exception.ResourceNotFoundException;
import com.hireai.job.entity.Job;
import com.hireai.job.repository.JobRepository;
import com.hireai.job.service.JobService;
import com.hireai.recruiter.entity.RecruiterProfile;
import com.hireai.recruiter.repository.RecruiterProfileRepository;
import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;
import com.hireai.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;
    private final JobService jobService;

    @Transactional
    public ApplicationDtos.ApplicationSummaryResponse applyForJob(ApplicationDtos.ApplyJobRequest request, User user) {
        CandidateProfile candidate = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Please complete your candidate profile before submitting an application"));

        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.jobId()));

        if (job.getStatus() != Job.JobStatus.PUBLISHED) {
            throw new BusinessException("This job posting is not currently accepting applications");
        }

        if (applicationRepository.existsByJobIdAndCandidateId(job.getId(), candidate.getId())) {
            throw new ConflictException("You have already submitted an application for this position");
        }

        Resume resume = null;
        if (request.resumeId() != null) {
            resume = resumeRepository.findById(request.resumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Specified resume not found"));
            if (!resume.getCandidate().getId().equals(candidate.getId())) {
                throw new BusinessException("Unauthorized access to resume");
            }
        } else {
            resume = resumeRepository.findByCandidateIdAndPrimaryTrue(candidate.getId()).orElse(null);
        }

        // Calculate AI match score automatically if resume text is present
        BigDecimal matchScore = BigDecimal.valueOf(70.0);
        if (resume != null && resume.getExtractedText() != null && !resume.getExtractedText().isBlank()) {
            try {
                AiDtos.MatchResultResponse matchResult = aiService.matchResumeToJob(
                        resume.getExtractedText(),
                        job.getTitle(),
                        job.getDescription() + " " + (job.getRequirements() != null ? job.getRequirements() : "")
                );
                matchScore = matchResult.overallMatchScore();
            } catch (Exception e) {
                log.warn("Automatic match score calculation failed, falling back to default: {}", e.getMessage());
            }
        }

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resume(resume)
                .coverLetter(request.coverLetter())
                .matchScore(matchScore)
                .status(Application.ApplicationStatus.APPLIED)
                .build();

        Application saved = applicationRepository.save(application);
        jobRepository.incrementApplications(job.getId());

        log.info("Application submitted: id={}, job={}, candidate={}, score={}",
                saved.getId(), job.getId(), candidate.getId(), matchScore);

        return toSummaryResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDtos.ApplicationSummaryResponse> getCandidateApplications(User user, Pageable pageable) {
        CandidateProfile candidate = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Candidate profile not found"));
        return applicationRepository.findByCandidateIdOrderByCreatedAtDesc(candidate.getId(), pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDtos.ApplicationSummaryResponse> getRecruiterApplications(UUID jobId, User user, Pageable pageable) {
        RecruiterProfile recruiter = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Recruiter profile not found"));

        if (jobId != null) {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
            if (!job.getRecruiter().getId().equals(recruiter.getId()) && user.getRole() != User.Role.ADMIN) {
                throw new BusinessException("You are not authorized to view applications for this job posting");
            }
            return applicationRepository.findByJobIdOrderByCreatedAtDesc(jobId, pageable)
                    .map(this::toSummaryResponse);
        }

        return applicationRepository.findByRecruiterId(recruiter.getId(), pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public ApplicationDtos.ApplicationDetailResponse getApplicationDetail(UUID applicationId, User user) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        // Authorization check
        if (user.getRole() == User.Role.CANDIDATE) {
            CandidateProfile candidate = candidateProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BusinessException("Candidate profile not found"));
            if (!app.getCandidate().getId().equals(candidate.getId())) {
                throw new BusinessException("Access denied to application: " + applicationId);
            }
        } else if (user.getRole() == User.Role.RECRUITER) {
            RecruiterProfile recruiter = recruiterProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BusinessException("Recruiter profile not found"));
            if (!app.getJob().getRecruiter().getId().equals(recruiter.getId()) && user.getRole() != User.Role.ADMIN) {
                throw new BusinessException("Access denied to application: " + applicationId);
            }
        }

        return toDetailResponse(app);
    }

    @Transactional
    public ApplicationDtos.ApplicationSummaryResponse updateApplicationStatus(
            UUID applicationId, ApplicationDtos.UpdateStatusRequest request, User user) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        RecruiterProfile recruiter = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Recruiter profile not found"));

        if (!app.getJob().getRecruiter().getId().equals(recruiter.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new BusinessException("You do not have permission to modify applications for this posting");
        }

        Application.ApplicationStatus current = app.getStatus();
        Application.ApplicationStatus target = request.status();

        if (current != target && !current.canTransitionTo(target)) {
            throw new BusinessException(
                    String.format("Invalid status transition from '%s' to '%s'", current, target));
        }

        app.setStatus(target);
        if (request.notes() != null) {
            app.setNotes(request.notes());
        }

        Application saved = applicationRepository.save(app);
        log.info("Application status transitioned: id={}, from={}, to={}", applicationId, current, target);
        return toSummaryResponse(saved);
    }

    private ApplicationDtos.ApplicationSummaryResponse toSummaryResponse(Application app) {
        String compName = app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "Unknown Company";
        String compLogo = app.getJob().getCompany() != null ? app.getJob().getCompany().getLogoUrl() : null;
        String resName = app.getResume() != null ? app.getResume().getOriginalFilename() : null;
        UUID resId = app.getResume() != null ? app.getResume().getId() : null;

        return new ApplicationDtos.ApplicationSummaryResponse(
                app.getId(),
                app.getJob().getId(),
                app.getJob().getTitle(),
                compName,
                compLogo,
                app.getCandidate().getId(),
                app.getCandidate().getFullName(),
                app.getCandidate().getUser() != null ? app.getCandidate().getUser().getEmail() : null,
                resId,
                resName,
                app.getStatus(),
                app.getMatchScore(),
                app.getCreatedAt(),
                app.getUpdatedAt()
        );
    }

    private ApplicationDtos.ApplicationDetailResponse toDetailResponse(Application app) {
        ApplicationDtos.CandidateSummary cand = new ApplicationDtos.CandidateSummary(
                app.getCandidate().getId(),
                app.getCandidate().getFullName(),
                app.getCandidate().getUser() != null ? app.getCandidate().getUser().getEmail() : "",
                app.getCandidate().getHeadline(),
                app.getCandidate().getLocation(),
                app.getCandidate().getTotalExperienceYears()
        );

        ApplicationDtos.ResumeSummary res = null;
        if (app.getResume() != null) {
            res = new ApplicationDtos.ResumeSummary(
                    app.getResume().getId(),
                    app.getResume().getFilename(),
                    app.getResume().getOriginalFilename(),
                    app.getResume().getContentType()
            );
        }

        return new ApplicationDtos.ApplicationDetailResponse(
                app.getId(),
                jobService.toSummaryResponse(app.getJob()),
                cand,
                res,
                app.getStatus(),
                app.getCoverLetter(),
                app.getMatchScore(),
                app.getNotes(),
                app.getCreatedAt(),
                app.getUpdatedAt()
        );
    }
}
