package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.scene.SceneDTO;

public record ScenePayload(
    SceneDTO scene
) implements ShotlistUpdatePayload { }
