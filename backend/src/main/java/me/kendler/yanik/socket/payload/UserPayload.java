package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.user.UserMinimalDTO;

public record UserPayload (
    UserMinimalDTO user
) implements ShotlistUpdatePayload { }
