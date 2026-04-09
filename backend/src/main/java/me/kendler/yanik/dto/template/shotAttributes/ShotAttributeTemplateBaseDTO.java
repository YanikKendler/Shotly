package me.kendler.yanik.dto.template.shotAttributes;

import me.kendler.yanik.dto.TypeName;

public interface ShotAttributeTemplateBaseDTO extends TypeName {
    Long getId();
    String getName();
    int getPosition();
}