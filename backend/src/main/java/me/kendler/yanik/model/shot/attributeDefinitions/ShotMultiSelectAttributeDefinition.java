package me.kendler.yanik.model.shot.attributeDefinitions;

import java.util.*;

import jakarta.persistence.*;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotMultiSelectAttributeDefinitionDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.SceneAttributeType;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.ShotAttributeType;
import me.kendler.yanik.model.shot.attributes.ShotAttributeBase;
import me.kendler.yanik.model.shot.attributes.ShotMultiSelectAttribute;

@Entity
@DiscriminatorValue("ShotMultiSelect")
public class ShotMultiSelectAttributeDefinition extends ShotAttributeDefinitionBase {
    public ShotMultiSelectAttributeDefinition() { super(); }

    public ShotMultiSelectAttributeDefinition(Shotlist shotlist) {
        super(shotlist);
    }

    public ShotMultiSelectAttributeDefinition(Shotlist shotlist, String name, int position) {
        super(shotlist, name, position);
    }

    @Override
    public ShotAttributeBase createAttribute(Shot shot) {
        return new ShotMultiSelectAttribute(this, shot);
    }

    @Override
    public ShotAttributeDefinitionBaseDTO toDTO() {
        return new ShotMultiSelectAttributeDefinitionDTO(
            id,
            name,
            position,
            new LinkedList<>(List.of(new ShotSelectAttributeOptionDefinition("Sorry, I'm lazy - this does not actually list the options, please use the specific shotAttributeDefinitions query", null)))
        );
    }
}