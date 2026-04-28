package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.shot.ShotDTO;

import java.time.ZonedDateTime;
import java.util.UUID;

public record ShotDetailPayload(
        ShotDTO shot
) implements ShotlistUpdatePayload { }
