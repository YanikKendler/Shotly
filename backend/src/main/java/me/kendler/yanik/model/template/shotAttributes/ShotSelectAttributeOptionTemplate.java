package me.kendler.yanik.model.template.shotAttributes;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotMultiSelectAttributeDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;

@Entity
@Table(name = "shotselectattributeoptiontemplate")
public class ShotSelectAttributeOptionTemplate extends PanacheEntity {
    public String name = "";
    @ManyToOne
    public ShotAttributeTemplateBase shotAttributeTemplate;

    public ShotSelectAttributeOptionTemplate() { }

    public ShotSelectAttributeOptionTemplate(ShotAttributeTemplateBase shotAttributeTemplate) {
        switch (shotAttributeTemplate) {
            case ShotSingleSelectAttributeTemplate singleSelectTemplate -> {
                singleSelectTemplate.options.add(this);
            }
            case ShotMultiSelectAttributeTemplate multiSelectTemplate -> {
                multiSelectTemplate.options.add(this);
            }
            default -> throw new ShotlyException("Unsupported shot attribute template type", ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }
        this.shotAttributeTemplate = shotAttributeTemplate;
    }

    public ShotSelectAttributeOptionDefinition createDefinition(ShotAttributeDefinitionBase attributeDefinition) {
        return new ShotSelectAttributeOptionDefinition(this.name, attributeDefinition);
    }
}