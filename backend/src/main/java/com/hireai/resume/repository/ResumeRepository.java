package com.hireai.resume.repository;

import com.hireai.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {

    List<Resume> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId);

    Optional<Resume> findByCandidateIdAndPrimaryTrue(UUID candidateId);

    @Modifying
    @Query("UPDATE Resume r SET r.primary = false WHERE r.candidate.id = :candidateId")
    void clearPrimaryForCandidate(UUID candidateId);

    boolean existsByIdAndCandidateId(UUID id, UUID candidateId);
}
