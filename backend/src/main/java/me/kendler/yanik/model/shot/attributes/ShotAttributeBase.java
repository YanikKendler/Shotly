package me.kendler.yanik.model.shot.attributes;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.inject.Inject;
import jakarta.persistence.*;
import me.kendler.yanik.dto.shot.attributes.ShotAttributeBaseDTO;
import me.kendler.yanik.dto.shot.ShotAttributeEditDTO;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;

@Entity
@Table(name = "shotattribute")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class ShotAttributeBase extends PanacheEntity {
    @ManyToOne()
    public ShotAttributeDefinitionBase definition;

    public ShotAttributeBase() { }

    public ShotAttributeBase(Shot shot, ShotAttributeDefinitionBase definition) {
        shot.attributes.add(this);
        this.definition = definition;
    }

    public abstract ShotAttributeBaseDTO toDTO();
}
