package com.hireai.resume.service;

import com.hireai.common.exception.StorageException;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
public class StorageService {

    @Value("${hireai.object-storage.endpoint:http://localhost:9000}")
    private String endpoint;

    @Value("${hireai.object-storage.bucket:hireai-resumes}")
    private String bucket;

    @Value("${hireai.object-storage.access-key:minioadmin}")
    private String accessKey;

    @Value("${hireai.object-storage.secret-key:minioadmin}")
    private String secretKey;

    private MinioClient minioClient;
    private boolean minioAvailable = false;
    private final Path localRoot = Paths.get("data", "resumes");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(localRoot);
            minioClient = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();

            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
            minioAvailable = true;
            log.info("MinIO storage initialized successfully for bucket: {}", bucket);
        } catch (Exception e) {
            minioAvailable = false;
            log.warn("MinIO storage unavailable ({}), utilizing local disk storage at '{}'", e.getMessage(), localRoot.toAbsolutePath());
        }
    }

    public void store(String storageKey, byte[] data, String contentType) {
        if (minioAvailable) {
            try {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucket)
                                .object(storageKey)
                                .stream(new ByteArrayInputStream(data), data.length, -1)
                                .contentType(contentType)
                                .build()
                );
                return;
            } catch (Exception e) {
                log.warn("MinIO putObject failed for key {}, falling back to local disk: {}", storageKey, e.getMessage());
            }
        }

        // Local fallback
        try {
            Path target = localRoot.resolve(storageKey);
            Files.createDirectories(target.getParent());
            Files.write(target, data);
        } catch (Exception ex) {
            throw new StorageException("Failed to save file to storage: " + ex.getMessage(), ex);
        }
    }

    public InputStream load(String storageKey) {
        if (minioAvailable) {
            try {
                return minioClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(bucket)
                                .object(storageKey)
                                .build()
                );
            } catch (Exception e) {
                log.warn("MinIO getObject failed for key {}, attempting local disk: {}", storageKey, e.getMessage());
            }
        }

        try {
            Path target = localRoot.resolve(storageKey);
            if (!Files.exists(target)) {
                throw new StorageException("File not found in storage: " + storageKey);
            }
            return Files.newInputStream(target);
        } catch (Exception e) {
            throw new StorageException("Failed to read file from storage: " + e.getMessage(), e);
        }
    }

    public void delete(String storageKey) {
        if (minioAvailable) {
            try {
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucket)
                                .object(storageKey)
                                .build()
                );
            } catch (Exception e) {
                log.warn("MinIO removeObject failed for key {}: {}", storageKey, e.getMessage());
            }
        }

        try {
            Path target = localRoot.resolve(storageKey);
            Files.deleteIfExists(target);
        } catch (Exception ignored) {
        }
    }
}
