package com.hireai.common.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Standard error response body for all API errors.
 * Never includes stack traces or internal details.
 */
@Getter
@Builder
public class ApiErrorResponse {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private final Instant timestamp;

    private final int status;
    private final String error;        // e.g. "VALIDATION_FAILED"
    private final String message;
    private final String path;

    /** Field-level validation errors, if applicable. */
    private final Map<String, List<String>> fieldErrors;
}
