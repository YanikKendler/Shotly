package me.kendler.yanik.dto.scene.attributes;

import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;

import java.util.List;
import java.util.Set;

public record SceneMultiSelectAttributeDTO(
        Long id,
        SceneAttributeDefinitionBaseDTO definition,
        List<SceneSelectAttributeOptionDefinition> multiSelectValue
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
