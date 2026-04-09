package me.kendler.yanik.model.template.sceneAttributes;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.model.template.shotAttributes.ShotAttributeTemplateBase;
import me.kendler.yanik.model.template.shotAttributes.ShotMultiSelectAttributeTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotSingleSelectAttributeTemplate;

@Entity
@Table(name = "sceneselectattributeoptiontemplate")
public class SceneSelectAttributeOptionTemplate extends PanacheEntity {
    public String name = "";
    @ManyToOne
    public SceneAttributeTemplateBase sceneAttributeTemplate;

    public SceneSelectAttributeOptionTemplate() { }

    public SceneSelectAttributeOptionTemplate(SceneAttributeTemplateBase sceneAttributeTemplate) {
        switch (sceneAttributeTemplate) {
            case SceneSingleSelectAttributeTemplate singleSelectTemplate -> {
                singleSelectTemplate.options.add(this);
            }
            case SceneMultiSelectAttributeTemplate multiSelectTemplate -> {
                multiSelectTemplate.options.add(this);
            }
            default -> throw new ShotlyException("Unsupported scene attribute template type", ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }
        this.sceneAttributeTemplate = sceneAttributeTemplate;
    }

    public SceneSelectAttributeOptionDefinition createDefinition(SceneAttributeDefinitionBase attributeDefinition) {
        return new SceneSelectAttributeOptionDefinition(this.name, attributeDefinition);
    }
}