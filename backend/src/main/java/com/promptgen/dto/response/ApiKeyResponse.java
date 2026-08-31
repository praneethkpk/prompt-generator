package com.promptgen.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class ApiKeyResponse {

    private String id;
    private String provider;
    private String label;
    private String maskedKey;
    private String endpointUrl;
    private String defaultModel;
    private boolean isActive;
    private LocalDateTime lastUsedAt;
    private LocalDateTime createdAt;

    public static ApiKeyResponse mask(String fullKey) {
        if (fullKey == null || fullKey.length() < 8) return null;
        return null;
    }
}
