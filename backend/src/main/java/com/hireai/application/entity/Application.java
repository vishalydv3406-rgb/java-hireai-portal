package com.hireai.application.entity;

import com.hireai.candidate.entity.CandidateProfile;
import com.hireai.job.entity.Job;
import com.hireai.resume.entity.Resume;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "match_score")
    private BigDecimal matchScore;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (status == null) status = ApplicationStatus.APPLIED;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum ApplicationStatus {
        APPLIED,
        UNDER_REVIEW,
        SHORTLISTED,
        INTERVIEW_SCHEDULED,
        OFFERED,
        REJECTED,
        WITHDRAWN;

        /**
         * Returns true if transitioning from this status to the target is a valid business operation.
         * Prevents illegal state transitions in the service layer.
         */
        public boolean canTransitionTo(ApplicationStatus target) {
            return switch (this) {
                case APPLIED         -> target == UNDER_REVIEW || target == REJECTED || target == WITHDRAWN;
                case UNDER_REVIEW    -> target == SHORTLISTED  || target == REJECTED || target == WITHDRAWN;
                case SHORTLISTED     -> target == INTERVIEW_SCHEDULED || target == REJECTED || target == WITHDRAWN;
                case INTERVIEW_SCHEDULED -> target == OFFERED  || target == REJECTED || target == WITHDRAWN;
                case OFFERED         -> target == REJECTED      || target == WITHDRAWN;
                case REJECTED, WITHDRAWN -> false; // terminal states
            };
        }
    }
}
