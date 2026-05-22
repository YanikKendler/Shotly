package me.kendler.yanik.dto.template.sceneAttributes;

import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.model.template.sceneAttributes.SceneSelectAttributeOptionTemplate;

import java.util.List;

public record SceneMultiSelectAttributeTemplateDTO(
    Long id,
    String name,
    int position,
    List<SceneSelectAttributeOptionTemplate> options
) implements SceneAttributeTemplateBaseDTO {
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
