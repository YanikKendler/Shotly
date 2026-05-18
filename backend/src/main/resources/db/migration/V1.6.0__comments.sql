CREATE TABLE comment (
    -- Primary Key
    id          UUID PRIMARY KEY,

    -- Relationships
    shot_id     UUID NOT NULL,
    owner_id     UUID NOT NULL,

    -- Content
    text        VARCHAR(1000) NOT NULL,

    -- Status Flags (Defaulting to false to match Java initialization)
    isArchived  BOOLEAN NOT NULL DEFAULT FALSE,
    isEdited    BOOLEAN NOT NULL DEFAULT FALSE,

    -- Timestamps (Using TIMESTAMPTZ for ZonedDateTime support)
    createdAt   TIMESTAMPTZ NOT NULL,
    editedAt    TIMESTAMPTZ NOT NULL,

    -- Foreign Key Constraints
    CONSTRAINT fk_comment_shot
        FOREIGN KEY (shot_id)
        REFERENCES shot (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY (owner_id)
        REFERENCES app_user (id)
        ON DELETE CASCADE
);

-- Indexes for optimized querying of comments by shot or user
CREATE INDEX idx_comment_shot_id ON comment(shot_id);
CREATE INDEX idx_comment_owner_id ON comment(owner_id);