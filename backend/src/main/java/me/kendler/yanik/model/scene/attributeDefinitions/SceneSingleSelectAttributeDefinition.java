package me.kendler.yanik.model.scene.attributeDefinitions;

import java.util.*;

import jakarta.persistence.*;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneMultiSelectAttributeDefinitionDTO;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneSingleSelectAttributeDefinitionDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.SceneAttributeType;
import me.kendler.yanik.model.scene.attributes.SceneAttributeBase;
import me.kendler.yanik.model.scene.attributes.SceneSingleSelectAttribute;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;

@Entity
@DiscriminatorValue("SceneSingleSelect")
public class SceneSingleSelectAttributeDefinition extends SceneAttributeDefinitionBase {
    @OneToMany(mappedBy = "sceneAttributeDefinition", fetch = FetchType.LAZY)
    public List<SceneSelectAttributeOptionDefinition> options = new ArrayList<>();

    public SceneSingleSelectAttributeDefinition() { super(); }

    public SceneSingleSelectAttributeDefinition(Shotlist shotlist) {
        super(shotlist);
    }

    public SceneSingleSelectAttributeDefinition(Shotlist shotlist, String name, int position) {
        super(shotlist, name, position);
    }

    @Override
    public SceneAttributeBase createAttribute(Scene scene) {
        return new SceneSingleSelectAttribute(this, scene);
    }

    @Override
    public SceneAttributeDefinitionBaseDTO toDTO() {
        return new SceneSingleSelectAttributeDefinitionDTO(
            id,
            name,
            position,
            new LinkedList<>(options)
        );
    }
}