package com.hireai.candidate.service;

import com.hireai.candidate.dto.CandidateDtos;
import com.hireai.candidate.entity.CandidateProfile;
import com.hireai.candidate.repository.CandidateProfileRepository;
import com.hireai.common.exception.ResourceNotFoundException;
import com.hireai.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;

    @Transactional(readOnly = true)
    public CandidateDtos.CandidateProfileResponse getProfile(User user) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));
        return toResponse(profile, user.getEmail());
    }

    @Transactional
    public CandidateDtos.CandidateProfileResponse updateProfile(User user, CandidateDtos.UpdateCandidateProfileRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder()
                        .user(user)
                        .fullName(request.fullName())
                        .build());

        profile.setFullName(request.fullName());
        if (request.headline() != null) profile.setHeadline(request.headline());
        if (request.location() != null) profile.setLocation(request.location());
        if (request.about() != null) profile.setAbout(request.about());
        if (request.phone() != null) profile.setPhone(request.phone());
        if (request.linkedinUrl() != null) profile.setLinkedinUrl(request.linkedinUrl());
        if (request.githubUrl() != null) profile.setGithubUrl(request.githubUrl());
        if (request.portfolioUrl() != null) profile.setPortfolioUrl(request.portfolioUrl());
        if (request.preferredLocations() != null) profile.setPreferredLocations(request.preferredLocations());
        if (request.employmentTypePref() != null) profile.setEmploymentTypePref(request.employmentTypePref());
        if (request.openToWork() != null) profile.setOpenToWork(request.openToWork());
        if (request.totalExperienceYears() != null) profile.setTotalExperienceYears(request.totalExperienceYears());

        CandidateProfile saved = candidateProfileRepository.save(profile);
        log.info("Candidate profile updated: id={}, user={}", saved.getId(), user.getId());
        return toResponse(saved, user.getEmail());
    }

    private CandidateDtos.CandidateProfileResponse toResponse(CandidateProfile p, String email) {
        return new CandidateDtos.CandidateProfileResponse(
                p.getId(),
                p.getUser() != null ? p.getUser().getId() : null,
                email,
                p.getFullName(),
                p.getHeadline(),
                p.getLocation(),
                p.getAbout(),
                p.getPhone(),
                p.getLinkedinUrl(),
                p.getGithubUrl(),
                p.getPortfolioUrl(),
                p.getPreferredLocations(),
                p.getEmploymentTypePref(),
                p.isOpenToWork(),
                p.getTotalExperienceYears(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
