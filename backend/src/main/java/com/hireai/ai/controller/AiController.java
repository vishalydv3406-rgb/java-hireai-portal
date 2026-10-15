package com.hireai.ai.controller;

import com.hireai.ai.dto.AiDtos;
import com.hireai.ai.service.AiService;
import com.hireai.job.entity.Job;
import com.hireai.job.repository.JobRepository;
import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Integration", description = "AI matching, resume parsing, and interview preparation APIs")
public class AiController {

    private final AiService aiService;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;

    @PostMapping("/match")
    @Operation(summary = "Calculate AI match score and gap analysis between resume and job")
    public ResponseEntity<AiDtos.MatchResultResponse> match(@RequestBody AiDtos.MatchRequest request) {
        String resumeText = request.resumeText();
        if ((resumeText == null || resumeText.isBlank()) && request.resumeId() != null) {
            resumeText = resumeRepository.findById(request.resumeId())
                    .map(Resume::getExtractedText)
                    .orElse("");
        }

        String jobTitle = request.jobTitle();
        String jobDesc = request.jobDescription();
        if (request.jobId() != null) {
            Job job = jobRepository.findById(request.jobId()).orElse(null);
            if (job != null) {
                if (jobTitle == null || jobTitle.isBlank()) jobTitle = job.getTitle();
                if (jobDesc == null || jobDesc.isBlank()) {
                    jobDesc = job.getDescription() + " " +
                            (job.getRequirements() != null ? job.getRequirements() : "");
                }
            }
        }

        return ResponseEntity.ok(aiService.matchResumeToJob(resumeText, jobTitle, jobDesc));
    }

    @PostMapping("/interview-prep")
    @Operation(summary = "Generate customized technical & behavioral interview questions")
    public ResponseEntity<AiDtos.InterviewPrepResponse> interviewPrep(@RequestBody AiDtos.InterviewPrepRequest request) {
        String resumeText = request.resumeText();
        if ((resumeText == null || resumeText.isBlank()) && request.resumeId() != null) {
            resumeText = resumeRepository.findById(request.resumeId())
                    .map(Resume::getExtractedText)
                    .orElse("");
        }
        return ResponseEntity.ok(aiService.generateInterviewPrep(resumeText, request.jobTitle(), request.jobDescription()));
    }

    @PostMapping("/parse-resume")
    @Operation(summary = "Extract contact details and technical competencies from resume text")
    public ResponseEntity<AiDtos.ParseResumeResponse> parseResume(@RequestBody String resumeText) {
        return ResponseEntity.ok(aiService.parseResume(resumeText));
    }
}
