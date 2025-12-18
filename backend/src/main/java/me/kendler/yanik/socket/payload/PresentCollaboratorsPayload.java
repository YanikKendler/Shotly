package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.user.UserMinimalDTO;

import java.util.List;

public record PresentCollaboratorsPayload(
    List<UserMinimalDTO> collaborators
) implements ShotlistUpdatePayload { }
