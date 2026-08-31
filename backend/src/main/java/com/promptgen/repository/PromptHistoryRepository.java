package com.promptgen.repository;

import com.promptgen.entity.PromptHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromptHistoryRepository extends JpaRepository<PromptHistory, UUID> {

    Page<PromptHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<PromptHistory> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}
