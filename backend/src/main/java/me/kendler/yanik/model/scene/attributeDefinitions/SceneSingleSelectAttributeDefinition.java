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

@Entity
@DiscriminatorValue("SceneSingleSelect")
public class SceneSingleSelectAttributeDefinition extends SceneAttributeDefinitionBase {
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
            new LinkedList<>(List.of(new SceneSelectAttributeOptionDefinition("Sorry, I'm lazy - this does not actually list the options, please use the specific shotAttributeDefinitions query", null)))
        );
    }
}