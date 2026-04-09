package me.kendler.yanik.dto.template.sceneAttributes;

import me.kendler.yanik.dto.TypeName;

public interface SceneAttributeTemplateBaseDTO extends TypeName {
    Long getId();
    String getName();
    int getPosition();
}