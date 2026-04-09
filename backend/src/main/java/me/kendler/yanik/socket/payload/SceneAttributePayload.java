package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.scene.attributes.SceneAttributeBaseDTO;

public record SceneAttributePayload(
    SceneAttributeBaseDTO attribute
) implements ShotlistUpdatePayload { }
