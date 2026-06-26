package me.kendler.yanik.socket.payload;

import me.kendler.yanik.socket.PresentCollaborator;

public record UserPayload (
    PresentCollaborator collaborator
) implements ShotlistUpdatePayload { }
