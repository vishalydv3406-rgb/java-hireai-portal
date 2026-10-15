package com.hireai.recruiter.service;

import com.hireai.common.exception.ResourceNotFoundException;
import com.hireai.company.dto.CompanyDtos;
import com.hireai.company.entity.Company;
import com.hireai.company.repository.CompanyRepository;
import com.hireai.company.service.CompanyService;
import com.hireai.recruiter.dto.RecruiterDtos;
import com.hireai.recruiter.entity.RecruiterProfile;
import com.hireai.recruiter.repository.RecruiterProfileRepository;
import com.hireai.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final CompanyService companyService;

    @Transactional(readOnly = true)
    public RecruiterDtos.RecruiterProfileResponse getProfile(User user) {
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));
        return toResponse(profile, user.getEmail());
    }

    @Transactional
    public RecruiterDtos.RecruiterProfileResponse updateProfile(User user, RecruiterDtos.UpdateRecruiterProfileRequest request) {
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> RecruiterProfile.builder()
                        .user(user)
                        .fullName(request.fullName())
                        .build());

        profile.setFullName(request.fullName());
        if (request.title() != null) profile.setTitle(request.title());
        if (request.phone() != null) profile.setPhone(request.phone());
        if (request.linkedinUrl() != null) profile.setLinkedinUrl(request.linkedinUrl());

        if (request.companyId() != null) {
            Company company = companyRepository.findById(request.companyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.companyId()));
            profile.setCompany(company);
        }

        RecruiterProfile saved = recruiterProfileRepository.save(profile);
        log.info("Recruiter profile updated: id={}, user={}", saved.getId(), user.getId());
        return toResponse(saved, user.getEmail());
    }

    private RecruiterDtos.RecruiterProfileResponse toResponse(RecruiterProfile p, String email) {
        CompanyDtos.CompanyResponse companyResp = p.getCompany() != null ?
                companyService.toResponse(p.getCompany()) : null;

        return new RecruiterDtos.RecruiterProfileResponse(
                p.getId(),
                p.getUser() != null ? p.getUser().getId() : null,
                email,
                p.getFullName(),
                p.getTitle(),
                p.getPhone(),
                p.getLinkedinUrl(),
                companyResp,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
