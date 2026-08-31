package com.promptgen.service;

import com.promptgen.dto.request.ApiKeyRequest;
import com.promptgen.dto.response.ApiKeyResponse;
import com.promptgen.entity.ApiKey;
import com.promptgen.entity.User;
import com.promptgen.exception.ResourceNotFoundException;
import com.promptgen.repository.ApiKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final EncryptionService encryptionService;

    @Transactional
    public ApiKeyResponse createApiKey(UUID userId, ApiKeyRequest request) {
        String encrypted = encryptionService.encrypt(request.getApiKey());

        ApiKey apiKey = ApiKey.builder()
                .provider(request.getProvider())
                .label(request.getLabel())
                .encryptedKey(encrypted)
                .iv("generated") // IV is embedded in the encrypted string
                .endpointUrl(request.getEndpointUrl())
                .defaultModel(request.getDefaultModel())
                .isActive(true)
                .build();

        apiKey.setUser(new User());
        apiKey.getUser().setId(userId);

        apiKey = apiKeyRepository.save(apiKey);
        log.info("API key created for user: {}, provider: {}", userId, request.getProvider());

        return toResponse(apiKey, request.getApiKey());
    }

    @Transactional(readOnly = true)
    public List<ApiKeyResponse> getApiKeys(UUID userId) {
        return apiKeyRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(key -> toResponse(key, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public ApiKeyResponse getApiKey(UUID userId, UUID keyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ApiKey", "id", keyId));
        return toResponse(apiKey, null);
    }

    @Transactional
    public ApiKeyResponse updateApiKey(UUID userId, UUID keyId, ApiKeyRequest request) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ApiKey", "id", keyId));

        apiKey.setProvider(request.getProvider());
        apiKey.setLabel(request.getLabel());
        apiKey.setEndpointUrl(request.getEndpointUrl());
        apiKey.setDefaultModel(request.getDefaultModel());

        if (request.getApiKey() != null && !request.getApiKey().isBlank()) {
            apiKey.setEncryptedKey(encryptionService.encrypt(request.getApiKey()));
        }

        apiKey = apiKeyRepository.save(apiKey);
        return toResponse(apiKey, request.getApiKey());
    }

    @Transactional
    public void deleteApiKey(UUID userId, UUID keyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ApiKey", "id", keyId));
        apiKeyRepository.delete(apiKey);
        log.info("API key deleted: {} for user: {}", keyId, userId);
    }

    @Transactional
    public ApiKeyResponse toggleApiKey(UUID userId, UUID keyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ApiKey", "id", keyId));
        apiKey.setIsActive(!apiKey.getIsActive());
        apiKey = apiKeyRepository.save(apiKey);
        return toResponse(apiKey, null);
    }

    /**
     * Get decrypted API key for LLM proxy calls.
     */
    public String getDecryptedKey(UUID userId, String provider) {
        ApiKey apiKey = apiKeyRepository.findByUserIdAndProviderAndIsActiveTrue(userId, provider)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ApiKey", "provider", provider));

        apiKey.setLastUsedAt(LocalDateTime.now());
        apiKeyRepository.save(apiKey);

        return encryptionService.decrypt(apiKey.getEncryptedKey());
    }

    private ApiKeyResponse toResponse(ApiKey apiKey, String rawKey) {
        String maskedKey = rawKey != null
                ? encryptionService.maskKey(rawKey)
                : "****";

        return ApiKeyResponse.builder()
                .id(apiKey.getId().toString())
                .provider(apiKey.getProvider())
                .label(apiKey.getLabel())
                .maskedKey(maskedKey)
                .endpointUrl(apiKey.getEndpointUrl())
                .defaultModel(apiKey.getDefaultModel())
                .isActive(apiKey.getIsActive())
                .lastUsedAt(apiKey.getLastUsedAt())
                .createdAt(apiKey.getCreatedAt())
                .build();
    }
}
