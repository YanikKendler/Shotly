package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.user.UserMinimalDTO;
import me.kendler.yanik.socket.PresentCollaborator;

import java.util.List;

public record PresentCollaboratorsPayload(
    List<PresentCollaborator> collaborators
) implements ShotlistUpdatePayload { }
