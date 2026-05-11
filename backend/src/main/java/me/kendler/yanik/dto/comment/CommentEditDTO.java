package me.kendler.yanik.dto.comment;

import java.util.UUID;

public record CommentEditDTO(
    UUID id,
    String text,
    Boolean isArchived
) { }
