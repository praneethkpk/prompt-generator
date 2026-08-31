package com.promptgen.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApiKeyRequest {

    @NotBlank(message = "Provider is required")
    @Size(max = 50, message = "Provider must be less than 50 characters")
    private String provider;

    @NotBlank(message = "API key is required")
    @Size(max = 500, message = "API key must be less than 500 characters")
    private String apiKey;

    @Size(max = 100, message = "Label must be less than 100 characters")
    private String label;

    @Size(max = 500, message = "Endpoint URL must be less than 500 characters")
    private String endpointUrl;

    @Size(max = 100, message = "Model must be less than 100 characters")
    private String defaultModel;
}
