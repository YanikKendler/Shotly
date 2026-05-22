package me.kendler.yanik.dto.shot.attributes;

import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;

public record ShotSingleSelectAttributeDTO(
    Long id,
    ShotAttributeDefinitionBaseDTO definition,
    ShotSelectAttributeOptionDefinition singleSelectValue
) implements ShotAttributeBaseDTO {
    @Override
    public Long getId() {
        return id;
    }

    @Override
    public ShotAttributeDefinitionBaseDTO getDefinition() {
        return definition;
    }
}
