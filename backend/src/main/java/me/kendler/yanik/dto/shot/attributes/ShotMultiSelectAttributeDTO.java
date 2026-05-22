package me.kendler.yanik.dto.shot.attributes;

import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;

import java.util.List;
import java.util.Set;

public record ShotMultiSelectAttributeDTO(
    Long id,
    ShotAttributeDefinitionBaseDTO definition,
    List<ShotSelectAttributeOptionDefinition> multiSelectValue
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
