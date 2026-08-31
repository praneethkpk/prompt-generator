package com.promptgen.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class PromptHistoryResponse {

    private String id;
    private String inputsJson;
    private String generatedPrompt;
    private String provider;
    private String model;
    private boolean isFavorite;
    private LocalDateTime createdAt;
}
