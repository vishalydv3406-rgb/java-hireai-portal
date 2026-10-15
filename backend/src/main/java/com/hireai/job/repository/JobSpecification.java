package com.hireai.job.repository;

import com.hireai.job.dto.JobDtos;
import com.hireai.job.entity.Job;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    public static Specification<Job> filter(JobDtos.JobSearchRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only show PUBLISHED jobs to public search
            predicates.add(cb.equal(root.get("status"), Job.JobStatus.PUBLISHED));

            if (filter == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            if (filter.keyword() != null && !filter.keyword().isBlank()) {
                String term = "%" + filter.keyword().toLowerCase().trim() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), term);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), term);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            if (filter.location() != null && !filter.location().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + filter.location().toLowerCase().trim() + "%"));
            }

            if (filter.employmentType() != null) {
                predicates.add(cb.equal(root.get("employmentType"), filter.employmentType()));
            }

            if (filter.remoteType() != null) {
                predicates.add(cb.equal(root.get("remoteType"), filter.remoteType()));
            }

            if (filter.salaryMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salaryMax"), filter.salaryMin()));
            }

            if (filter.minExperience() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("minExperienceYears"), filter.minExperience()));
            }

            if (filter.companyId() != null) {
                predicates.add(cb.equal(root.get("company").get("id"), filter.companyId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
