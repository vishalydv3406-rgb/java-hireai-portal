package com.hireai.job.repository;

import com.hireai.job.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID>, JpaSpecificationExecutor<Job> {

    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);

    List<Job> findByRecruiterIdAndStatus(UUID recruiterId, Job.JobStatus status);

    @Query("SELECT j FROM Job j WHERE j.recruiter.id = :recruiterId ORDER BY j.createdAt DESC")
    Page<Job> findByRecruiterId(UUID recruiterId, Pageable pageable);

    @Modifying
    @Query("UPDATE Job j SET j.viewsCount = j.viewsCount + 1 WHERE j.id = :id")
    void incrementViews(UUID id);

    @Modifying
    @Query("UPDATE Job j SET j.applicationsCount = j.applicationsCount + 1 WHERE j.id = :id")
    void incrementApplications(UUID id);

    boolean existsByIdAndRecruiterId(UUID jobId, UUID recruiterId);
}
