package me.kendler.yanik.socket;

import me.kendler.yanik.socket.payload.ShotlistUpdatePayload;

import java.time.ZonedDateTime;
import java.util.UUID;

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
