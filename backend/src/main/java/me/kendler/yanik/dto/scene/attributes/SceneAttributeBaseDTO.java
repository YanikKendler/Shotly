package me.kendler.yanik.dto.scene.attributes;

import me.kendler.yanik.dto.TypeName;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;

public interface SceneAttributeBaseDTO extends TypeName {
    Long getId();
    SceneAttributeDefinitionBaseDTO getDefinition();
}
