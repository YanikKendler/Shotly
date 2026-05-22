package me.kendler.yanik.dto.shot.attributeDefinitions;

import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;

public record ShotTextAttributeDefinitionDTO(
    Long id,
    String name,
    int position
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
