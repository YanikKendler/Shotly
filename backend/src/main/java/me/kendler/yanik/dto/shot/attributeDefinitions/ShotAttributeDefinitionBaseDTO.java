package me.kendler.yanik.dto.shot.attributeDefinitions;


import me.kendler.yanik.dto.TypeName;

public interface ShotAttributeDefinitionBaseDTO extends TypeName {
    Long getId();
    String getName();
    int getPosition();
}