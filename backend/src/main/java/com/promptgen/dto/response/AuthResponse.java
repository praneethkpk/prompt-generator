package com.promptgen.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String userId;
    private String name;
    private String email;

    public static AuthResponse of(String accessToken, String refreshToken,
                                   String userId, String name, String email) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(userId)
                .name(name)
                .email(email)
                .build();
    }
}
