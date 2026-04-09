package me.kendler.yanik.model.scene.attributeDefinitions;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import me.kendler.yanik.dto.scene.SceneAttributeDefinitionEditDTO;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.SceneAttributeType;
import me.kendler.yanik.model.scene.attributes.SceneAttributeBase;

/**
 * Base class for scene attribute definitions.
 * Defines all the attributes that every single scene in a shotlist has, stores the selection options and names for those attributes.
 */
@Entity
@Table(name = "sceneattributedefinition")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class SceneAttributeDefinitionBase extends PanacheEntity {
    public String name;
    public int position;

    public SceneAttributeDefinitionBase() { }

    public SceneAttributeDefinitionBase(Shotlist shotlist){
        this.position = shotlist.sceneAttributeDefinitions.size();
        shotlist.sceneAttributeDefinitions.add(this);
    }

    public SceneAttributeDefinitionBase(Shotlist shotlist, String name, int position) {
        this(shotlist);
        this.name = name;
        this.position = position;
    }

    public void update(SceneAttributeDefinitionEditDTO editDTO){
        this.name = editDTO.name();
        this.position = editDTO.position();
    }

    abstract public SceneAttributeBase createAttribute(Scene scene);

    public abstract SceneAttributeDefinitionBaseDTO toDTO();
}