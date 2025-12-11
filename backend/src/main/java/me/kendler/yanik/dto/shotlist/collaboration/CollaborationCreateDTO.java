package me.kendler.yanik.dto.shotlist.collaboration;

import java.util.UUID;

public record CollaborationCreateDTO(
    UUID shotlistId,
    String email
) { }
