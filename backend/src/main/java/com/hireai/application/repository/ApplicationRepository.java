package com.hireai.application.repository;

import com.hireai.application.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    Page<Application> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId, Pageable pageable);

    Page<Application> findByJobIdOrderByCreatedAtDesc(UUID jobId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.job.recruiter.id = :recruiterId ORDER BY a.createdAt DESC")
    Page<Application> findByRecruiterId(UUID recruiterId, Pageable pageable);

    boolean existsByJobIdAndCandidateId(UUID jobId, UUID candidateId);

    Optional<Application> findByJobIdAndCandidateId(UUID jobId, UUID candidateId);

    long countByJobId(UUID jobId);
}
