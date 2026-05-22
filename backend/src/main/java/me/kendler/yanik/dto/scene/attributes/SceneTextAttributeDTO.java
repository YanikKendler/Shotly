package me.kendler.yanik.dto.scene.attributes;

import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;

public record SceneTextAttributeDTO(
        Long id,
        SceneAttributeDefinitionBaseDTO definition,
        String textValue
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
