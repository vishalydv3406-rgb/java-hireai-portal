package com.hireai.company.dto;

import com.hireai.company.entity.Company;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class CompanyDtos {

    public record CreateCompanyRequest(
            @NotBlank @Size(max = 200) String name,
            String description,
            String website,
            String logoUrl,
            String industry,
            String sizeRange,
            String headquarters,
            Integer foundedYear
    ) {}

    public record UpdateCompanyRequest(
            @Size(max = 200) String name,
            String description,
            String website,
            String logoUrl,
            String industry,
            String sizeRange,
            String headquarters,
            Integer foundedYear
    ) {}

    public record CompanyResponse(
            UUID id,
            String name,
            String slug,
            String description,
            String website,
            String logoUrl,
            String industry,
            String sizeRange,
            String headquarters,
            Integer foundedYear,
            Company.VerificationStatus verificationStatus
    ) {}
}
