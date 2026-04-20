package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.shot.attributes.ShotAttributeBaseDTO;
import me.kendler.yanik.model.shot.ShotAttributeType;

import java.util.UUID;

public record ShotAttributePayload(
    ShotAttributeBaseDTO attribute,
    UUID shotId,
    UUID sceneId
) implements ShotlistUpdatePayload { }
