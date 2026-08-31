package com.promptgen.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class PromptOptimizeResponse {

    private String optimizedPrompt;
    private String provider;
    private String model;
}
