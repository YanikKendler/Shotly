package me.kendler.yanik.socket;

import me.kendler.yanik.socket.payload.ShotlistUpdatePayload;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Every update made to a shotlist that is sent over websocket uses this DTO for metadata
 * The payload can be various type of data depending on the type of update
 */
public record ShotlistUpdateDTO(
    ShotlistUpdateType type,
    UUID userId,
    ZonedDateTime timestamp,
    ShotlistUpdatePayload payload
) {
    public ShotlistUpdateDTO(ShotlistUpdateType type, UUID userId, ShotlistUpdatePayload payload) {
        this(type, userId, ZonedDateTime.now(), payload);
    }
}
