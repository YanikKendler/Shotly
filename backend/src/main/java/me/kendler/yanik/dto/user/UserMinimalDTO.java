package me.kendler.yanik.dto.user;

import me.kendler.yanik.model.UserTier;

import java.time.ZonedDateTime;
import java.util.UUID;

public record UserMinimalDTO(
        UUID id,
        String email,
        String auth0Sub,
        String name,
        UserTier tier,
        ZonedDateTime createdAt
) { }
