package com.promptgen.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.promptgen.dto.request.PromptOptimizeRequest;
import com.promptgen.dto.response.PromptHistoryResponse;
import com.promptgen.dto.response.PromptOptimizeResponse;
import com.promptgen.entity.PromptHistory;
import com.promptgen.entity.User;
import com.promptgen.exception.ResourceNotFoundException;
import com.promptgen.repository.PromptHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromptService {

    private final PromptHistoryRepository promptHistoryRepository;
    private final ApiKeyService apiKeyService;
    private final LlmProxyService llmProxyService;
    private final ObjectMapper objectMapper;

    @Transactional
    public PromptOptimizeResponse optimizePrompt(UUID userId, PromptOptimizeRequest request) {
        String provider = request.getProvider() != null ? request.getProvider() : "gemini";
        String model = request.getModel() != null ? request.getModel() : "gemini-3.6-flash";

        String decryptedKey = apiKeyService.getDecryptedKey(userId, provider);

        String metaPrompt = buildMetaPrompt(request);

        String optimizedPrompt = llmProxyService.callLlm(provider, model, decryptedKey, metaPrompt);

        // Save to history
        try {
            String inputsJson = objectMapper.writeValueAsString(request);
            PromptHistory history = PromptHistory.builder()
                    .inputsJson(inputsJson)
                    .generatedPrompt(optimizedPrompt)
                    .provider(provider)
                    .model(model)
                    .build();
            history.setUser(new User());
            history.getUser().setId(userId);
            promptHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to save prompt history", e);
        }

        return PromptOptimizeResponse.builder()
                .optimizedPrompt(optimizedPrompt)
                .provider(provider)
                .model(model)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<PromptHistoryResponse> getHistory(UUID userId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return promptHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toHistoryResponse);
    }

    @Transactional
    public void toggleFavorite(UUID userId, UUID historyId) {
        PromptHistory history = promptHistoryRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("PromptHistory", "id", historyId));
        history.setIsFavorite(!history.getIsFavorite());
        promptHistoryRepository.save(history);
    }

    @Transactional
    public void deleteHistory(UUID userId, UUID historyId) {
        promptHistoryRepository.deleteByIdAndUserId(historyId, userId);
    }

    private String buildMetaPrompt(PromptOptimizeRequest request) {
        return """
                You are a world-class Prompt Engineer. Transform the rough user inputs into a single, highly-optimised system prompt.

                <user_inputs>
                  <role>%s</role>
                  <context>%s</context>
                  <task>%s</task>
                  <desired_output_format>%s</desired_output_format>
                </user_inputs>

                <instructions>
                Generate one polished prompt that includes:
                1. <role> - Detailed persona description
                2. <context> - Rich background and context
                3. <instructions> - Step-by-step instructions with Chain-of-Thought
                4. <constraints> - Safety rules and guardrails
                5. <output_format> - Precise output structure
                6. <chain_of_thought> - Self-review directive
                </instructions>

                <meta_constraints>
                - Output ONLY the generated prompt.
                - Self-contained and ready to use.
                - 300-800 words.
                </meta_constraints>
                """.formatted(
                request.getRole(),
                request.getContext(),
                request.getTask(),
                request.getOutputFormat()
        );
    }

    private PromptHistoryResponse toHistoryResponse(PromptHistory history) {
        return PromptHistoryResponse.builder()
                .id(history.getId().toString())
                .inputsJson(history.getInputsJson())
                .generatedPrompt(history.getGeneratedPrompt())
                .provider(history.getProvider())
                .model(history.getModel())
                .isFavorite(history.getIsFavorite())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
