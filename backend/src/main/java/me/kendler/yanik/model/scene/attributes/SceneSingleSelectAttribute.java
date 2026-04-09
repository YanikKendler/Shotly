package me.kendler.yanik.model.scene.attributes;

import jakarta.persistence.*;
import me.kendler.yanik.dto.scene.attributes.SceneAttributeBaseDTO;
import me.kendler.yanik.dto.scene.SceneAttributeEditDTO;
import me.kendler.yanik.dto.scene.attributes.SceneSingleSelectAttributeDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSingleSelectAttributeDefinition;

@Entity
public class SceneSingleSelectAttribute extends SceneAttributeBase{
    @ManyToOne()
    public SceneSelectAttributeOptionDefinition value;

    public SceneSingleSelectAttribute() { super(); }

    public SceneSingleSelectAttribute(SceneSingleSelectAttributeDefinition definition, Scene scene) {
        super(scene, definition);
    }

    @Override
    public SceneAttributeBaseDTO toDTO() {
        return new SceneSingleSelectAttributeDTO(
            id,
            definition.toDTO(),
            value
        );
    }
}