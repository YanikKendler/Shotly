package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.shotlist.ShotlistMinimalDTO;

public record ShotlistPayload(
    ShotlistMinimalDTO shotlist
) implements ShotlistUpdatePayload { }
