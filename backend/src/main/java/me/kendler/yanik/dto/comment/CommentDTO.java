package me.kendler.yanik.dto.comment;

import me.kendler.yanik.dto.user.UserMinimalDTO;
import java.time.ZonedDateTime;
import java.util.UUID;

public record CommentDTO(
    UUID id,
    UUID shotId,
    UserMinimalDTO user,
    String text,
    Boolean isArchived,
    Boolean isEdited,
    ZonedDateTime createdAt,
    ZonedDateTime editedAt
) {}
