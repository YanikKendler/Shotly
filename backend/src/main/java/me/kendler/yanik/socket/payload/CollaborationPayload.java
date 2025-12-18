package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;
import me.kendler.yanik.model.CollaborationType;

import java.util.UUID;

public record CollaborationPayload(
    UUID userId,
    CollaborationType type
) implements ShotlistUpdatePayload { }
