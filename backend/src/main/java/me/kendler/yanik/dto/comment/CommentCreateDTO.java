package me.kendler.yanik.dto.comment;

import java.util.UUID;

public record CommentCreateDTO(
    UUID id,
    UUID shotId,
    String text
) { }
