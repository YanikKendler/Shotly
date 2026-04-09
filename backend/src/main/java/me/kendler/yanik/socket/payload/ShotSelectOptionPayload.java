package me.kendler.yanik.socket.payload;

import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;

public record ShotSelectOptionPayload(
    ShotSelectAttributeOptionDefinition optionDefinition
) implements ShotlistUpdatePayload{ }
