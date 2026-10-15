package com.hireai.application.service;

import com.hireai.application.dto.ApplicationDtos;
import com.hireai.application.entity.Application;
import com.hireai.application.repository.ApplicationRepository;
import com.hireai.candidate.entity.CandidateProfile;
import com.hireai.common.exception.BusinessException;
import com.hireai.job.entity.Job;
import com.hireai.recruiter.entity.RecruiterProfile;
import com.hireai.recruiter.repository.RecruiterProfileRepository;
import com.hireai.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private RecruiterProfileRepository recruiterProfileRepository;

    @InjectMocks
    private ApplicationService applicationService;

    @Test
    @DisplayName("Should successfully transition application status from APPLIED to UNDER_REVIEW")
    void updateStatus_ValidTransition() {
        UUID appId = UUID.randomUUID();
        UUID recruiterId = UUID.randomUUID();

        User recruiterUser = User.builder().id(UUID.randomUUID()).role(User.Role.RECRUITER).build();
        RecruiterProfile recruiterProfile = RecruiterProfile.builder().id(recruiterId).user(recruiterUser).build();

        Job job = Job.builder().id(UUID.randomUUID()).title("Senior Java Engineer").recruiter(recruiterProfile).build();
        CandidateProfile candidate = CandidateProfile.builder().id(UUID.randomUUID()).fullName("Jane Dev").build();

        Application app = Application.builder()
                .id(appId)
                .job(job)
                .candidate(candidate)
                .status(Application.ApplicationStatus.APPLIED)
                .build();

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));
        when(recruiterProfileRepository.findByUserId(recruiterUser.getId())).thenReturn(Optional.of(recruiterProfile));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        ApplicationDtos.UpdateStatusRequest request = new ApplicationDtos.UpdateStatusRequest(
                Application.ApplicationStatus.UNDER_REVIEW, "Profile shortlisted for review"
        );

        ApplicationDtos.ApplicationSummaryResponse response =
                applicationService.updateApplicationStatus(appId, request, recruiterUser);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(Application.ApplicationStatus.UNDER_REVIEW);
        verify(applicationRepository).save(app);
    }

    @Test
    @DisplayName("Should throw BusinessException when attempting invalid state transition (REJECTED -> OFFERED)")
    void updateStatus_InvalidTransition_ThrowsBusinessException() {
        UUID appId = UUID.randomUUID();
        UUID recruiterId = UUID.randomUUID();

        User recruiterUser = User.builder().id(UUID.randomUUID()).role(User.Role.RECRUITER).build();
        RecruiterProfile recruiterProfile = RecruiterProfile.builder().id(recruiterId).user(recruiterUser).build();

        Job job = Job.builder().id(UUID.randomUUID()).title("Senior Java Engineer").recruiter(recruiterProfile).build();
        CandidateProfile candidate = CandidateProfile.builder().id(UUID.randomUUID()).fullName("Jane Dev").build();

        Application app = Application.builder()
                .id(appId)
                .job(job)
                .candidate(candidate)
                .status(Application.ApplicationStatus.REJECTED) // Terminal state!
                .build();

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));
        when(recruiterProfileRepository.findByUserId(recruiterUser.getId())).thenReturn(Optional.of(recruiterProfile));

        ApplicationDtos.UpdateStatusRequest request = new ApplicationDtos.UpdateStatusRequest(
                Application.ApplicationStatus.OFFERED, "Attempt invalid transition"
        );

        assertThatThrownBy(() -> applicationService.updateApplicationStatus(appId, request, recruiterUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid status transition");

        verify(applicationRepository, never()).save(any());
    }
}
