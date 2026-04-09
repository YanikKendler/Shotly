package me.kendler.yanik.model.template.sceneAttributes;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateBaseDTO;
import me.kendler.yanik.dto.template.shotAttributes.ShotAttributeTemplateBaseDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.template.Template;

@Entity
@Table(name = "sceneattributetemplate")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class SceneAttributeTemplateBase extends PanacheEntity {
    @ManyToOne
    public Template template;
    public String name;
    public int position;

    public SceneAttributeTemplateBase() { }

    public SceneAttributeTemplateBase(Template template) {
        this.template = template;
        this.position = template.sceneAttributes.size();
        template.sceneAttributes.add(this);
    }

    abstract public String getType();

    abstract public SceneAttributeDefinitionBase createDefinition(Shotlist shotlist);

    public abstract SceneAttributeTemplateBaseDTO toDTO();
}
