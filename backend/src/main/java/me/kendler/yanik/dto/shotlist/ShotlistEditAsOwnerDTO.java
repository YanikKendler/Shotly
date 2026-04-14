package me.kendler.yanik.dto.shotlist;

import java.util.UUID;

public record ShotlistEditAsOwnerDTO(
    UUID id,
    boolean isArchived
){ }
