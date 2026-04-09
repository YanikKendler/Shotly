package me.kendler.yanik.model.scene.attributes;

import java.util.*;

import jakarta.persistence.*;
import me.kendler.yanik.dto.scene.attributes.SceneAttributeBaseDTO;
import me.kendler.yanik.dto.scene.SceneAttributeEditDTO;
import me.kendler.yanik.dto.scene.attributes.SceneMultiSelectAttributeDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneMultiSelectAttributeDefinition;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import org.hibernate.annotations.BatchSize;

@Entity
public class SceneMultiSelectAttribute extends SceneAttributeBase{
    @ManyToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 10)
    public Set<SceneSelectAttributeOptionDefinition> value = new HashSet<>();

    public SceneMultiSelectAttribute() { super(); }

    public SceneMultiSelectAttribute(SceneMultiSelectAttributeDefinition definition, Scene scene) {
        super(scene, definition);
    }

    @Override
    public SceneAttributeBaseDTO toDTO() {
        return new SceneMultiSelectAttributeDTO(
            id,
            definition.toDTO(),
            value.stream().sorted(Comparator.comparing(option -> option.name.toUpperCase())).toList()
        );
    }
}