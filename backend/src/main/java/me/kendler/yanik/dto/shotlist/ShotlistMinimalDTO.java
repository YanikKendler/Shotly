package me.kendler.yanik.dto.shotlist;

import java.time.ZonedDateTime;
import java.util.UUID;

public record ShotlistMinimalDTO(
    UUID id,
    UUID ownerId,
    UUID templateId,
    String name,
    Boolean isArchived,
    ZonedDateTime createdAt,
    ZonedDateTime editedAt
) { }
