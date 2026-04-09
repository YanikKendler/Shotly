package me.kendler.yanik.model.shot.attributeDefinitions;

import java.util.*;

import jakarta.persistence.*;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotSingleSelectAttributeDefinitionDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotTextAttributeDefinitionDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.ShotAttributeType;
import me.kendler.yanik.model.shot.attributes.ShotAttributeBase;
import me.kendler.yanik.model.shot.attributes.ShotSingleSelectAttribute;

@Entity
@DiscriminatorValue("ShotSingleSelect")
public class ShotSingleSelectAttributeDefinition extends ShotAttributeDefinitionBase {
    public ShotSingleSelectAttributeDefinition() { super(); }

    public ShotSingleSelectAttributeDefinition(Shotlist shotlist) {
        super(shotlist);
    }

    public ShotSingleSelectAttributeDefinition(Shotlist shotlist, String name, int position) {
        super(shotlist, name, position);
    }

    @Override
    public ShotAttributeBase createAttribute(Shot shot) {
        return new ShotSingleSelectAttribute(this, shot);
    }

    @Override
    public ShotAttributeDefinitionBaseDTO toDTO() {
        return new ShotSingleSelectAttributeDefinitionDTO(
            id,
            name,
            position,
            new LinkedList<>(List.of(new ShotSelectAttributeOptionDefinition("Sorry, I'm lazy - this does not actually list the options, please use the specific shotAttributeDefinitions query", null)))
        );
    }
}