package me.kendler.yanik.model.shot.attributes;

import jakarta.persistence.*;
import me.kendler.yanik.dto.shot.attributes.ShotAttributeBaseDTO;
import me.kendler.yanik.dto.shot.attributes.ShotSingleSelectAttributeDTO;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSingleSelectAttributeDefinition;

@Entity
public class ShotSingleSelectAttribute extends ShotAttributeBase {
    @ManyToOne()
    public ShotSelectAttributeOptionDefinition value;

    public ShotSingleSelectAttribute() { }

    public ShotSingleSelectAttribute(ShotSingleSelectAttributeDefinition definition, Shot shot) {
        super(shot, definition);
    }

    @Override
    public ShotAttributeBaseDTO toDTO() {
        return new ShotSingleSelectAttributeDTO(
            id,
            definition.toDTO(),
            value
        );
    }
}