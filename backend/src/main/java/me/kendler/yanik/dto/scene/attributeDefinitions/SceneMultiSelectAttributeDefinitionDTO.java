package me.kendler.yanik.dto.scene.attributeDefinitions;

import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;

import java.util.List;

public record SceneMultiSelectAttributeDefinitionDTO(
    Long id,
    String name,
    int position,
    List<SceneSelectAttributeOptionDefinition> options
) implements SceneAttributeDefinitionBaseDTO {
    @Override
    public Long getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public int getPosition() {
        return position;
    }
}
