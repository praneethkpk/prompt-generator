CREATE TABLE prompt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inputs_json TEXT,
    generated_prompt TEXT NOT NULL,
    provider VARCHAR(50),
    model VARCHAR(100),
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_history_user ON prompt_history(user_id);
CREATE INDEX idx_prompt_history_created ON prompt_history(user_id, created_at DESC);
