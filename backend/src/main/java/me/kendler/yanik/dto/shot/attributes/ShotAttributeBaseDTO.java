package me.kendler.yanik.dto.shot.attributes;


import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;

public interface ShotAttributeBaseDTO {
    Long getId();
    ShotAttributeDefinitionBaseDTO getDefinition();
}