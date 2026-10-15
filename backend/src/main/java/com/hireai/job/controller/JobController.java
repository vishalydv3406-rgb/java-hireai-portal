package com.hireai.job.controller;

import com.hireai.job.dto.JobDtos;
import com.hireai.job.entity.Job;
import com.hireai.job.service.JobService;
import com.hireai.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Public Job Search and Detail APIs")
public class JobController {

    private final JobService jobService;

    @GetMapping("/api/v1/jobs")
    @Operation(summary = "Search published jobs with multi-criteria filtering")
    public ResponseEntity<Page<JobDtos.JobSummaryResponse>> searchJobs(
            @ModelAttribute JobDtos.JobSearchRequest filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(jobService.searchJobs(filter, pageable));
    }

    @GetMapping("/api/v1/jobs/{id}")
    @Operation(summary = "Get detailed information about a single job")
    public ResponseEntity<JobDtos.JobDetailResponse> getJobById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // ── Recruiter Scoped Endpoints ─────────────────────────────────────

    @PostMapping("/api/v1/recruiter/jobs")
    @Operation(summary = "Create and publish a new job opening")
    public ResponseEntity<JobDtos.JobDetailResponse> createJob(
            @Valid @RequestBody JobDtos.CreateJobRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(request, user));
    }

    @PutMapping("/api/v1/recruiter/jobs/{id}")
    @Operation(summary = "Update an existing job posting")
    public ResponseEntity<JobDtos.JobDetailResponse> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobDtos.UpdateJobRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobService.updateJob(id, request, user));
    }

    @PatchMapping("/api/v1/recruiter/jobs/{id}/status")
    @Operation(summary = "Change status of a job posting (DRAFT, PUBLISHED, CLOSED, ARCHIVED)")
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID id,
            @RequestParam Job.JobStatus status,
            @AuthenticationPrincipal User user) {
        jobService.changeJobStatus(id, status, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/recruiter/jobs")
    @Operation(summary = "List jobs posted by the logged-in recruiter")
    public ResponseEntity<Page<JobDtos.JobSummaryResponse>> getMyJobs(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(jobService.getRecruiterJobs(user, pageable));
    }
}
