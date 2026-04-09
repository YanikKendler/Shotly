package me.kendler.yanik.model.scene.attributeDefinitions;

import jakarta.persistence.*;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneMultiSelectAttributeDefinitionDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.SceneAttributeType;
import me.kendler.yanik.model.scene.attributes.SceneAttributeBase;
import me.kendler.yanik.model.scene.attributes.SceneMultiSelectAttribute;

import java.util.LinkedList;
import java.util.List;

@Entity
@DiscriminatorValue("SceneMultiSelect")
public class SceneMultiSelectAttributeDefinition extends SceneAttributeDefinitionBase {
    public SceneMultiSelectAttributeDefinition() { super(); }

    public SceneMultiSelectAttributeDefinition(Shotlist shotlist) {
        super(shotlist);
    }

    public SceneMultiSelectAttributeDefinition(Shotlist shotlist, String name, int position) {
        super(shotlist, name, position);
    }

    @Override
    public SceneAttributeBase createAttribute(Scene scene) {
        return new SceneMultiSelectAttribute(this, scene);
    }

    @Override
    public SceneAttributeDefinitionBaseDTO toDTO() {
        return new SceneMultiSelectAttributeDefinitionDTO(
            id,
            name,
            position,
            new LinkedList<>(List.of(new SceneSelectAttributeOptionDefinition("Sorry, I'm lazy - this does not actually list the options, please use the specific shotAttributeDefinitions query", null)))
        );
    }
}