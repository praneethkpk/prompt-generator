package com.promptgen.controller;

import com.promptgen.dto.request.PromptOptimizeRequest;
import com.promptgen.dto.response.ApiResponse;
import com.promptgen.dto.response.PromptHistoryResponse;
import com.promptgen.dto.response.PromptOptimizeResponse;
import com.promptgen.security.UserPrincipal;
import com.promptgen.service.PromptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/prompts")
@RequiredArgsConstructor
public class PromptController {

    private final PromptService promptService;

    @PostMapping("/optimize")
    public ResponseEntity<ApiResponse<PromptOptimizeResponse>> optimizePrompt(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody PromptOptimizeRequest request) {
        PromptOptimizeResponse response = promptService.optimizePrompt(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Prompt optimized", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<PromptHistoryResponse>>> getHistory(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                promptService.getHistory(user.getId(), page, size)));
    }

    @PatchMapping("/history/{id}/favorite")
    public ResponseEntity<ApiResponse<Void>> toggleFavorite(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id) {
        promptService.toggleFavorite(user.getId(), java.util.UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.success("Favorite toggled", null));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHistory(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id) {
        promptService.deleteHistory(user.getId(), java.util.UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.success("History deleted", null));
    }
}
