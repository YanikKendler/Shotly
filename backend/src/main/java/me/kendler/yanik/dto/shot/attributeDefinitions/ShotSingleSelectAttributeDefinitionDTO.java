package me.kendler.yanik.dto.shot.attributeDefinitions;

import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;

import java.util.List;

public record ShotSingleSelectAttributeDefinitionDTO(
    Long id,
    String name,
    int position,
    List<ShotSelectAttributeOptionDefinition> options
) implements ShotAttributeDefinitionBaseDTO {
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
