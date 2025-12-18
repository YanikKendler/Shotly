package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.shot.attributes.ShotAttributeBaseDTO;
import me.kendler.yanik.model.shot.ShotAttributeType;

public record ShotAttributePayload(
    ShotAttributeBaseDTO attribute
) implements ShotlistUpdatePayload { }
