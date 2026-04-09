package me.kendler.yanik.model.template.shotAttributes;

import jakarta.persistence.*;
import me.kendler.yanik.dto.template.shotAttributes.ShotAttributeTemplateBaseDTO;
import me.kendler.yanik.dto.template.shotAttributes.ShotTextAttributeTemplateDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSingleSelectAttributeDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotTextAttributeDefinition;
import me.kendler.yanik.model.template.Template;

@Entity
public class ShotTextAttributeTemplate extends ShotAttributeTemplateBase {
    public ShotTextAttributeTemplate() { }

    public ShotTextAttributeTemplate(Template template) {
        super(template);
    }

    @Override
    public String getType() {
        return "ShotText";
    }

    @Override
    public ShotAttributeDefinitionBase createDefinition(Shotlist shotlist) {
        return new ShotTextAttributeDefinition(shotlist, name, this.position);
    }

    @Override
    public ShotAttributeTemplateBaseDTO toDTO() {
        return new ShotTextAttributeTemplateDTO(
            this.id,
            this.name,
            this.position
        );
    }
}