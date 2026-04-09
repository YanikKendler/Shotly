package me.kendler.yanik.model.template.sceneAttributes;

import jakarta.persistence.*;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateBaseDTO;
import me.kendler.yanik.dto.template.sceneAttributes.SceneTextAttributeTemplateDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneTextAttributeDefinition;
import me.kendler.yanik.model.template.Template;

@Entity
public class SceneTextAttributeTemplate extends SceneAttributeTemplateBase {
    public SceneTextAttributeTemplate() { }

    public SceneTextAttributeTemplate(Template template) {
        super(template);
    }

    @Override
    public String getType() {
        return "SceneText";
    }

    @Override
    public SceneAttributeDefinitionBase createDefinition(Shotlist shotlist) {
        return new SceneTextAttributeDefinition(shotlist, name, this.position);
    }

    @Override
    public SceneAttributeTemplateBaseDTO toDTO() {
        return new SceneTextAttributeTemplateDTO(
            this.id,
            this.name,
            this.position
        );
    }
}