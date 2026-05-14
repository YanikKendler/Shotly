package me.kendler.yanik.socket.payload;

import java.util.UUID;

public record SelectedSceneAttributePayload(
    UUID sceneId,
    Long attributeId
) implements ShotlistUpdatePayload { }
