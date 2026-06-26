package me.kendler.yanik.socket.payload;

import java.util.UUID;

public record SelectedScenePayload(
    UUID sceneId
) implements ShotlistUpdatePayload { }
