package me.kendler.yanik.model.template.sceneAttributes;

import java.util.*;

import jakarta.persistence.*;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateBaseDTO;
import me.kendler.yanik.dto.template.sceneAttributes.SceneMultiSelectAttributeTemplateDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneMultiSelectAttributeDefinition;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.model.template.Template;
import org.hibernate.annotations.BatchSize;

@Entity
public class SceneMultiSelectAttributeTemplate extends SceneAttributeTemplateBase {
    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 10)
    public Set<SceneSelectAttributeOptionTemplate> options = new HashSet<>();

    public SceneMultiSelectAttributeTemplate() { }

    public SceneMultiSelectAttributeTemplate(Template template) {
        super(template);
    }

    @Override
    public String getType() {
        return "SceneMultiSelect";
    }

    @Override
    public SceneAttributeDefinitionBase createDefinition(Shotlist shotlist) {
        SceneMultiSelectAttributeDefinition attributeDefinition = new SceneMultiSelectAttributeDefinition(shotlist, this.name, this.position);

        for (SceneSelectAttributeOptionTemplate option : options) {
            SceneSelectAttributeOptionDefinition optionDefinition = option.createDefinition(attributeDefinition);
            persist(optionDefinition);
        }

        return attributeDefinition;
    }

    @Override
    public SceneAttributeTemplateBaseDTO toDTO() {
        return new SceneMultiSelectAttributeTemplateDTO(
            this.id,
            this.name,
            this.position,
            options.stream().toList()
        );
    }
}