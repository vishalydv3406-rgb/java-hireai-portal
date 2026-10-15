package com.hireai.job.service;

import com.hireai.common.exception.BusinessException;
import com.hireai.common.exception.ResourceNotFoundException;
import com.hireai.company.entity.Company;
import com.hireai.company.repository.CompanyRepository;
import com.hireai.job.dto.JobDtos;
import com.hireai.job.entity.Job;
import com.hireai.job.repository.JobRepository;
import com.hireai.job.repository.JobSpecification;
import com.hireai.recruiter.entity.RecruiterProfile;
import com.hireai.recruiter.repository.RecruiterProfileRepository;
import com.hireai.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public Page<JobDtos.JobSummaryResponse> searchJobs(JobDtos.JobSearchRequest filter, Pageable pageable) {
        return jobRepository.findAll(JobSpecification.filter(filter), pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional
    public JobDtos.JobDetailResponse getJobById(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        // Increment view count asynchronously/inline
        jobRepository.incrementViews(id);
        job.setViewsCount(job.getViewsCount() + 1);

        return toDetailResponse(job);
    }

    @Transactional
    public JobDtos.JobDetailResponse createJob(JobDtos.CreateJobRequest request, User user) {
        RecruiterProfile recruiter = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Recruiter profile not found for user: " + user.getEmail()));

        Company company = recruiter.getCompany();
        if (company == null) {
            // If company is not set, find first company or throw
            List<Company> companies = companyRepository.findAll();
            if (!companies.isEmpty()) {
                company = companies.get(0);
                recruiter.setCompany(company);
                recruiterProfileRepository.save(recruiter);
            } else {
                throw new BusinessException("Recruiter must be associated with a registered company before posting jobs");
            }
        }

        Job job = Job.builder()
                .title(request.title())
                .description(request.description())
                .responsibilities(request.responsibilities())
                .requirements(request.requirements())
                .benefits(request.benefits())
                .employmentType(request.employmentType())
                .location(request.location())
                .remoteType(request.remoteType() != null ? request.remoteType() : Job.RemoteType.ONSITE)
                .minExperienceYears(request.minExperienceYears())
                .maxExperienceYears(request.maxExperienceYears())
                .salaryMin(request.salaryMin())
                .salaryMax(request.salaryMax())
                .salaryCurrency(request.salaryCurrency() != null ? request.salaryCurrency() : "USD")
                .status(Job.JobStatus.PUBLISHED)
                .publishedAt(Instant.now())
                .closesAt(request.closesAt())
                .company(company)
                .recruiter(recruiter)
                .build();

        Job saved = jobRepository.save(job);
        log.info("Job created: id={}, title={}, recruiter={}", saved.getId(), saved.getTitle(), recruiter.getId());
        return toDetailResponse(saved);
    }

    @Transactional
    public JobDtos.JobDetailResponse updateJob(UUID jobId, JobDtos.UpdateJobRequest request, User user) {
        Job job = getJobAndValidateOwnership(jobId, user);

        if (request.title() != null) job.setTitle(request.title());
        if (request.description() != null) job.setDescription(request.description());
        if (request.responsibilities() != null) job.setResponsibilities(request.responsibilities());
        if (request.requirements() != null) job.setRequirements(request.requirements());
        if (request.benefits() != null) job.setBenefits(request.benefits());
        if (request.employmentType() != null) job.setEmploymentType(request.employmentType());
        if (request.location() != null) job.setLocation(request.location());
        if (request.remoteType() != null) job.setRemoteType(request.remoteType());
        if (request.minExperienceYears() != null) job.setMinExperienceYears(request.minExperienceYears());
        if (request.maxExperienceYears() != null) job.setMaxExperienceYears(request.maxExperienceYears());
        if (request.salaryMin() != null) job.setSalaryMin(request.salaryMin());
        if (request.salaryMax() != null) job.setSalaryMax(request.salaryMax());
        if (request.salaryCurrency() != null) job.setSalaryCurrency(request.salaryCurrency());
        if (request.closesAt() != null) job.setClosesAt(request.closesAt());

        Job updated = jobRepository.save(job);
        return toDetailResponse(updated);
    }

    @Transactional
    public void changeJobStatus(UUID jobId, Job.JobStatus status, User user) {
        Job job = getJobAndValidateOwnership(jobId, user);
        job.setStatus(status);
        if (status == Job.JobStatus.PUBLISHED && job.getPublishedAt() == null) {
            job.setPublishedAt(Instant.now());
        }
        jobRepository.save(job);
        log.info("Job status changed: id={}, newStatus={}", jobId, status);
    }

    @Transactional(readOnly = true)
    public Page<JobDtos.JobSummaryResponse> getRecruiterJobs(User user, Pageable pageable) {
        RecruiterProfile recruiter = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Recruiter profile not found"));
        return jobRepository.findByRecruiterId(recruiter.getId(), pageable)
                .map(this::toSummaryResponse);
    }

    private Job getJobAndValidateOwnership(UUID jobId, User user) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        RecruiterProfile recruiter = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Recruiter profile not found"));

        if (!job.getRecruiter().getId().equals(recruiter.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new BusinessException("You are not authorized to modify this job posting");
        }
        return job;
    }

    public JobDtos.JobSummaryResponse toSummaryResponse(Job job) {
        JobDtos.CompanyInfo companyInfo = null;
        if (job.getCompany() != null) {
            Company c = job.getCompany();
            JobDtos.Company.VerificationStatus vs = c.getVerificationStatus() != null ?
                    JobDtos.Company.VerificationStatus.valueOf(c.getVerificationStatus().name()) :
                    JobDtos.Company.VerificationStatus.PENDING;
            companyInfo = new JobDtos.CompanyInfo(
                    c.getId(), c.getName(), c.getSlug(), c.getLogoUrl(), c.getIndustry(), c.getHeadquarters(), vs
            );
        }

        return new JobDtos.JobSummaryResponse(
                job.getId(),
                job.getTitle(),
                companyInfo,
                job.getLocation(),
                job.getEmploymentType(),
                job.getRemoteType(),
                job.getSalaryMin(),
                job.getSalaryMax(),
                job.getSalaryCurrency(),
                job.getMinExperienceYears(),
                job.getStatus(),
                job.getPublishedAt(),
                job.getApplicationsCount(),
                Collections.emptyList()
        );
    }

    public JobDtos.JobDetailResponse toDetailResponse(Job job) {
        JobDtos.CompanyInfo companyInfo = null;
        if (job.getCompany() != null) {
            Company c = job.getCompany();
            JobDtos.Company.VerificationStatus vs = c.getVerificationStatus() != null ?
                    JobDtos.Company.VerificationStatus.valueOf(c.getVerificationStatus().name()) :
                    JobDtos.Company.VerificationStatus.PENDING;
            companyInfo = new JobDtos.CompanyInfo(
                    c.getId(), c.getName(), c.getSlug(), c.getLogoUrl(), c.getIndustry(), c.getHeadquarters(), vs
            );
        }

        return new JobDtos.JobDetailResponse(
                job.getId(),
                job.getTitle(),
                companyInfo,
                job.getDescription(),
                job.getResponsibilities(),
                job.getRequirements(),
                job.getBenefits(),
                job.getLocation(),
                job.getEmploymentType(),
                job.getRemoteType(),
                job.getSalaryMin(),
                job.getSalaryMax(),
                job.getSalaryCurrency(),
                job.getMinExperienceYears(),
                job.getMaxExperienceYears(),
                job.getStatus(),
                job.getPublishedAt(),
                job.getClosesAt(),
                job.getViewsCount(),
                job.getApplicationsCount(),
                Collections.emptyList(),
                Collections.emptyList()
        );
    }
}
