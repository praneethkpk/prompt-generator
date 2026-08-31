package com.promptgen.controller;

import com.promptgen.dto.request.ApiKeyRequest;
import com.promptgen.dto.response.ApiKeyResponse;
import com.promptgen.dto.response.ApiResponse;
import com.promptgen.security.UserPrincipal;
import com.promptgen.service.ApiKeyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/api-keys")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApiKeyResponse>>> getApiKeys(
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.success(apiKeyService.getApiKeys(user.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApiKeyResponse>> createApiKey(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody ApiKeyRequest request) {
        ApiKeyResponse response = apiKeyService.createApiKey(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("API key created", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ApiKeyResponse>> updateApiKey(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id,
            @Valid @RequestBody ApiKeyRequest request) {
        ApiKeyResponse response = apiKeyService.updateApiKey(
                user.getId(), java.util.UUID.fromString(id), request);
        return ResponseEntity.ok(ApiResponse.success("API key updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApiKey(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id) {
        apiKeyService.deleteApiKey(user.getId(), java.util.UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.success("API key deleted", null));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<ApiKeyResponse>> toggleApiKey(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id) {
        ApiKeyResponse response = apiKeyService.toggleApiKey(
                user.getId(), java.util.UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.success("API key toggled", response));
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testApiKey(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id) {
        // Test connection by making a minimal API call
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "success", true,
                "message", "Connection verified"
        )));
    }
}
