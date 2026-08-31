package com.promptgen.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@Slf4j
public class LlmProxyService {

    private static final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final java.util.Map<String, String> PROVIDER_URLS = java.util.Map.of(
            "gemini", "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            "openai", "https://api.openai.com/v1/chat/completions",
            "groq", "https://api.groq.com/openai/v1/chat/completions",
            "deepseek", "https://api.deepseek.com/v1/chat/completions",
            "mistral", "https://api.mistral.ai/v1/chat/completions"
    );

    /**
     * Proxy a prompt optimization request to the AI provider.
     */
    public String callLlm(String provider, String model, String apiKey, String metaPrompt) {
        String baseUrl = PROVIDER_URLS.getOrDefault(provider, PROVIDER_URLS.get("gemini"));

        String requestBody = """
                {
                    "model": "%s",
                    "messages": [
                        {"role": "system", "content": "You are a world-class prompt engineer. Follow the meta-prompt instructions precisely."},
                        {"role": "user", "content": %s}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2048
                }
                """.formatted(model, escapeJson(metaPrompt));

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("LLM API error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("LLM API returned status " + response.statusCode());
            }

            return extractContent(response.body());

        } catch (Exception e) {
            log.error("LLM proxy call failed", e);
            throw new RuntimeException("Failed to call LLM: " + e.getMessage(), e);
        }
    }

    private String extractContent(String responseBody) {
        try {
            var json = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseBody);
            var choices = json.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                var message = choices.get(0).get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
            return "No content in response";
        } catch (Exception e) {
            return responseBody;
        }
    }

    private String escapeJson(String text) {
        return "\"" + text
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }
}
