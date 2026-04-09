package me.kendler.yanik.model.template.shotAttributes;

import java.util.*;

import jakarta.persistence.*;
import me.kendler.yanik.dto.template.shotAttributes.ShotAttributeTemplateBaseDTO;
import me.kendler.yanik.dto.template.shotAttributes.ShotMultiSelectAttributeTemplateDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneMultiSelectAttributeDefinition;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotMultiSelectAttributeDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.model.template.sceneAttributes.SceneSelectAttributeOptionTemplate;
import org.hibernate.annotations.BatchSize;

@Entity
public class ShotMultiSelectAttributeTemplate extends ShotAttributeTemplateBase {
    @OneToMany(fetch = FetchType.LAZY) // these all need to be lazy to avoid circular references and performance issues
    @BatchSize(size = 10)
    public Set<ShotSelectAttributeOptionTemplate> options = new HashSet<>();

    public ShotMultiSelectAttributeTemplate() { }

    public ShotMultiSelectAttributeTemplate(Template template) {
        super(template);
    }

    @Override
    public String getType() {
        return "ShotMultiSelect";
    }

    @Override
    public ShotAttributeDefinitionBase createDefinition(Shotlist shotlist) {
        ShotMultiSelectAttributeDefinition attributeDefinition = new ShotMultiSelectAttributeDefinition(shotlist, this.name, this.position);

        for (ShotSelectAttributeOptionTemplate option : options) {
            ShotSelectAttributeOptionDefinition optionDefinition = option.createDefinition(attributeDefinition);
            persist(optionDefinition);
        }

        return attributeDefinition;
    }

    @Override
    public ShotAttributeTemplateBaseDTO toDTO() {
        return new ShotMultiSelectAttributeTemplateDTO(
            this.id,
            this.name,
            this.position,
            options.stream().toList()
        );
    }
}