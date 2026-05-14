package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.comment.CommentDTO;

public record CommentPayload(
    CommentDTO comment
) implements ShotlistUpdatePayload { }
