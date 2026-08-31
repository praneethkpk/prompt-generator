package com.promptgen.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PromptOptimizeRequest {

    @NotBlank(message = "Prompt input is required")
    private String role;

    @NotBlank(message = "Context is required")
    private String context;

    @NotBlank(message = "Task is required")
    private String task;

    @NotBlank(message = "Output format is required")
    private String outputFormat;

    private String provider;
    private String model;
}
