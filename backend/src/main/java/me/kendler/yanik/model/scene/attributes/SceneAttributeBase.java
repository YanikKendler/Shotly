package me.kendler.yanik.model.scene.attributes;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import me.kendler.yanik.dto.scene.attributes.SceneAttributeBaseDTO;
import me.kendler.yanik.dto.scene.SceneAttributeEditDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;

@Entity
@Table(name = "sceneattribute")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class SceneAttributeBase extends PanacheEntity {
    @ManyToOne()
    public SceneAttributeDefinitionBase definition;

    public SceneAttributeBase() { }

    public SceneAttributeBase(Scene scene, SceneAttributeDefinitionBase definition) {
        scene.attributes.add(this);
        this.definition = definition;
    }

    public abstract SceneAttributeBaseDTO toDTO();
}