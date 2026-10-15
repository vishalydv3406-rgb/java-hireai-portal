package com.hireai.application.controller;

import com.hireai.application.dto.ApplicationDtos;
import com.hireai.application.service.ApplicationService;
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
@Tag(name = "Applications", description = "Job application lifecycle endpoints")
public class ApplicationController {

    private final ApplicationService applicationService;

    // ── Candidate Scoped Endpoints ─────────────────────────────────────

    @PostMapping("/api/v1/candidate/applications")
    @Operation(summary = "Submit a job application")
    public ResponseEntity<ApplicationDtos.ApplicationSummaryResponse> applyForJob(
            @Valid @RequestBody ApplicationDtos.ApplyJobRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.applyForJob(request, user));
    }

    @GetMapping("/api/v1/candidate/applications")
    @Operation(summary = "List all applications submitted by candidate")
    public ResponseEntity<Page<ApplicationDtos.ApplicationSummaryResponse>> getCandidateApplications(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getCandidateApplications(user, pageable));
    }

    @GetMapping("/api/v1/candidate/applications/{id}")
    @Operation(summary = "Get candidate application detail")
    public ResponseEntity<ApplicationDtos.ApplicationDetailResponse> getCandidateApplicationDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getApplicationDetail(id, user));
    }

    // ── Recruiter Scoped Endpoints ─────────────────────────────────────

    @GetMapping("/api/v1/recruiter/applications")
    @Operation(summary = "List candidate applications for recruiter jobs")
    public ResponseEntity<Page<ApplicationDtos.ApplicationSummaryResponse>> getRecruiterApplications(
            @RequestParam(value = "jobId", required = false) UUID jobId,
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getRecruiterApplications(jobId, user, pageable));
    }

    @GetMapping("/api/v1/recruiter/applications/{id}")
    @Operation(summary = "Get detailed application view including resume text and candidate profile")
    public ResponseEntity<ApplicationDtos.ApplicationDetailResponse> getRecruiterApplicationDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getApplicationDetail(id, user));
    }

    @PatchMapping("/api/v1/recruiter/applications/{id}/status")
    @Operation(summary = "Transition application status (SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED)")
    public ResponseEntity<ApplicationDtos.ApplicationSummaryResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationDtos.UpdateStatusRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, request, user));
    }
}
