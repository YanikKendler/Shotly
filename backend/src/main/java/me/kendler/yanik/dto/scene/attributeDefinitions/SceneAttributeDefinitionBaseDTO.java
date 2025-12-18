package me.kendler.yanik.dto.scene.attributeDefinitions;

import me.kendler.yanik.dto.TypeName;

public interface SceneAttributeDefinitionBaseDTO extends TypeName {
    Long getId();
    String getName();
    int getPosition();
}