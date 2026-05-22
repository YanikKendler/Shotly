package me.kendler.yanik.dto.scene.attributes;

import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;

public record SceneSingleSelectAttributeDTO(
        Long id,
        SceneAttributeDefinitionBaseDTO definition,
        SceneSelectAttributeOptionDefinition singleSelectValue
) implements SceneAttributeBaseDTO{
    @Override
    public Long getId() {
        return id;
    }

    @Override
    public SceneAttributeDefinitionBaseDTO getDefinition() {
        return definition;
    }
}
