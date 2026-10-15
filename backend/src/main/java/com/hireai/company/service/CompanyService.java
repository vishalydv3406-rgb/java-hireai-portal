package com.hireai.company.service;

import com.hireai.common.exception.ConflictException;
import com.hireai.common.exception.ResourceNotFoundException;
import com.hireai.company.dto.CompanyDtos;
import com.hireai.company.entity.Company;
import com.hireai.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public Page<CompanyDtos.CompanyResponse> getAllCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CompanyDtos.CompanyResponse getCompanyById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return toResponse(company);
    }

    @Transactional(readOnly = true)
    public CompanyDtos.CompanyResponse getCompanyBySlug(String slug) {
        Company company = companyRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with slug: " + slug));
        return toResponse(company);
    }

    @Transactional
    public CompanyDtos.CompanyResponse createCompany(CompanyDtos.CreateCompanyRequest request) {
        String slug = toSlug(request.name());
        if (companyRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        Company company = Company.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .website(request.website())
                .logoUrl(request.logoUrl())
                .industry(request.industry())
                .sizeRange(request.sizeRange())
                .headquarters(request.headquarters())
                .foundedYear(request.foundedYear())
                .verificationStatus(Company.VerificationStatus.VERIFIED)
                .build();

        Company saved = companyRepository.save(company);
        log.info("Company created: id={}, name={}", saved.getId(), saved.getName());
        return toResponse(saved);
    }

    public CompanyDtos.CompanyResponse toResponse(Company c) {
        return new CompanyDtos.CompanyResponse(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getDescription(),
                c.getWebsite(),
                c.getLogoUrl(),
                c.getIndustry(),
                c.getSizeRange(),
                c.getHeadquarters(),
                c.getFoundedYear(),
                c.getVerificationStatus()
        );
    }

    private String toSlug(String input) {
        return input.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }
}
