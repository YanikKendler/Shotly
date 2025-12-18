package me.kendler.yanik.socket.payload;

import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;

public record SceneSelectOptionPayload(
    SceneSelectAttributeOptionDefinition optionDefinition
) implements ShotlistUpdatePayload { }
