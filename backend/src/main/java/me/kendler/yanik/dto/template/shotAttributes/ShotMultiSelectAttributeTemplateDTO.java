package me.kendler.yanik.dto.template.shotAttributes;

import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;
import me.kendler.yanik.model.template.shotAttributes.ShotSelectAttributeOptionTemplate;

import java.util.List;

public record ShotMultiSelectAttributeTemplateDTO(
    Long id,
    String name,
    int position,
    List<ShotSelectAttributeOptionTemplate> options
) implements ShotAttributeTemplateBaseDTO {
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
