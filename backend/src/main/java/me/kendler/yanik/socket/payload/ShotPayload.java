package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.shot.ShotDTO;

public record ShotPayload(
    ShotDTO shot
) implements ShotlistUpdatePayload { }
