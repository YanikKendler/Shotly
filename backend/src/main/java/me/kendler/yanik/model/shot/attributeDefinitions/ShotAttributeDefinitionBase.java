package me.kendler.yanik.model.shot.attributeDefinitions;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.attributes.ShotAttributeBase;

/**
 * Base class for shot attribute definitions.
 * Defines all the attributes that every single shot in a shotlist has, stores the selection options and names for those attributes.
 */
@Entity
@Table(name = "shotattributedefinition")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class ShotAttributeDefinitionBase extends PanacheEntity {
    public String name;
    public int position;

    public ShotAttributeDefinitionBase() { }

    public ShotAttributeDefinitionBase(Shotlist shotlist) {
        this.position = shotlist.shotAttributeDefinitions.size();
        shotlist.shotAttributeDefinitions.add(this);
    }

    public ShotAttributeDefinitionBase(Shotlist shotlist, String name, int position) {
        this(shotlist);
        this.name = name;
        this.position = position;
    }

    abstract public ShotAttributeBase createAttribute(Shot shot);

    public abstract ShotAttributeDefinitionBaseDTO toDTO();
}
