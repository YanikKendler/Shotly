package me.kendler.yanik.dto.user;

import java.util.UUID;

public record UserBlockDTO(
    UUID userId,
    boolean isBlocked
) { }
