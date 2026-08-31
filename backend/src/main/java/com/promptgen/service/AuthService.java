package com.promptgen.service;

import com.promptgen.config.JwtConfig;
import com.promptgen.dto.request.LoginRequest;
import com.promptgen.dto.request.RefreshTokenRequest;
import com.promptgen.dto.request.RegisterRequest;
import com.promptgen.dto.response.AuthResponse;
import com.promptgen.entity.RefreshToken;
import com.promptgen.entity.User;
import com.promptgen.exception.DuplicateResourceException;
import com.promptgen.exception.UnauthorizedException;
import com.promptgen.repository.RefreshTokenRepository;
import com.promptgen.repository.UserRepository;
import com.promptgen.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        log.info("User logged in: {}", user.getEmail());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String tokenType = tokenProvider.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new UnauthorizedException("Invalid token type");
        }

        UUID userId = tokenProvider.getUserIdFromToken(refreshToken);
        UUID tokenId = tokenProvider.getTokenIdFromToken(refreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(hashToken(refreshToken))
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!storedToken.getId().equals(tokenId)
                || !storedToken.getUserId().equals(userId)
                || storedToken.getRevokedAt() != null
                || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            if (storedToken.getRevokedAt() != null) {
                refreshTokenRepository.deleteByUserId(userId);
            }
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        storedToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(storedToken);

        return issueTokens(user);
    }

    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
        log.info("User logged out: {}", userId);
    }

    private AuthResponse issueTokens(User user) {
        UUID refreshTokenId = UUID.randomUUID();
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getEmail(), refreshTokenId);

        refreshTokenRepository.save(RefreshToken.builder()
                .id(refreshTokenId)
                .userId(user.getId())
                .tokenHash(hashToken(refreshToken))
                .expiresAt(LocalDateTime.now()
                        .plusSeconds(tokenProvider.getRefreshTokenExpirationMs() / 1000))
                .build());

        return AuthResponse.of(accessToken, refreshToken,
                user.getId().toString(), user.getName(), user.getEmail());
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private String hashToken(String token) {
        try {
            byte[] hash = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash);
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }
}
