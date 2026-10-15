package com.hireai.resume.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Slf4j
@Component
public class ResumeTextExtractor {

    private final Tika tika = new Tika();

    public String extractText(byte[] fileData, String filename) {
        try (InputStream stream = new ByteArrayInputStream(fileData)) {
            String extracted = tika.parseToString(stream);
            if (extracted == null) {
                return "";
            }
            // Normalize spaces and line endings
            String normalized = extracted.replaceAll("\\r\\n", "\n")
                    .replaceAll("[ \\t]+", " ")
                    .replaceAll("\\n{3,}", "\n\n")
                    .trim();

            // Safety limit (e.g. 15,000 characters)
            if (normalized.length() > 15000) {
                return normalized.substring(0, 15000);
            }
            return normalized;
        } catch (Exception e) {
            log.error("Failed to extract text from file '{}': {}", filename, e.getMessage());
            return "";
        }
    }
}
