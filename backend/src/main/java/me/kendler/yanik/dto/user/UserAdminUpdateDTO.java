package me.kendler.yanik.dto.user;

import me.kendler.yanik.model.UserTier;

import java.time.LocalDate;
import java.util.UUID;

public record UserAdminUpdateDTO(
    UUID id,
    Boolean isActive,
    UserTier tier,
    LocalDate revokeProAfter
) { }
