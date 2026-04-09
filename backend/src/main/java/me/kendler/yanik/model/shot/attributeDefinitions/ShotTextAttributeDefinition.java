package me.kendler.yanik.model.shot.attributeDefinitions;

import jakarta.persistence.*;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotTextAttributeDefinitionDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.ShotAttributeType;
import me.kendler.yanik.model.shot.attributes.ShotAttributeBase;
import me.kendler.yanik.model.shot.attributes.ShotTextAttribute;

import java.util.List;

@Entity
@DiscriminatorValue("ShotText")
public class ShotTextAttributeDefinition extends ShotAttributeDefinitionBase {
    public ShotTextAttributeDefinition() { super(); }

    public ShotTextAttributeDefinition(Shotlist shotlist) {
        super(shotlist);
    }

    public ShotTextAttributeDefinition(Shotlist shotlist, String name, int position) {
        super(shotlist, name, position);
    }

    @Override
    public ShotAttributeBase createAttribute(Shot shot) {
        return new ShotTextAttribute(this, shot);
    }

    @Override
    public ShotAttributeDefinitionBaseDTO toDTO() {
        return new ShotTextAttributeDefinitionDTO(
            id,
            name,
            position
        );
    }
}