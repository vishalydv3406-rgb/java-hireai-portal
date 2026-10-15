package com.hireai.resume.controller;

import com.hireai.resume.dto.ResumeDtos;
import com.hireai.resume.service.ResumeService;
import com.hireai.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidate/resumes")
@RequiredArgsConstructor
@Tag(name = "Resumes", description = "Candidate resume management and upload APIs")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a candidate resume (PDF, DOCX) and extract text")
    public ResponseEntity<ResumeDtos.ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "label", required = false) String label,
            @RequestParam(value = "primary", defaultValue = "false") boolean primary,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.uploadResume(file, label, primary, user));
    }

    @GetMapping
    @Operation(summary = "List all resumes belonging to the authenticated candidate")
    public ResponseEntity<List<ResumeDtos.ResumeResponse>> getResumes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getCandidateResumes(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed resume info including extracted text")
    public ResponseEntity<ResumeDtos.ResumeDetailResponse> getResumeDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getResumeDetail(id, user));
    }

    @PatchMapping("/{id}/primary")
    @Operation(summary = "Mark a resume as primary")
    public ResponseEntity<Void> setPrimary(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        resumeService.setPrimaryResume(id, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an uploaded resume")
    public ResponseEntity<Void> deleteResume(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        resumeService.deleteResume(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download raw resume file")
    public ResponseEntity<InputStreamResource> downloadResume(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        ResumeDtos.ResumeDetailResponse detail = resumeService.getResumeDetail(id, user);
        InputStream stream = resumeService.getResumeStream(id, user);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + detail.originalFilename() + "\"")
                .contentType(MediaType.parseMediaType(detail.contentType()))
                .body(new InputStreamResource(stream));
    }
}
