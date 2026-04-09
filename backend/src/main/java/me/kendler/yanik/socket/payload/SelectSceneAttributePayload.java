package me.kendler.yanik.socket.payload;

import java.util.UUID;

public record SelectSceneAttributePayload (
    UUID sceneId,
    Long attributeId
) implements ShotlistUpdatePayload { }
