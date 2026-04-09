package me.kendler.yanik.dto.shotlist;

import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;
import me.kendler.yanik.dto.scene.SceneDTO;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.model.template.Template;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record ShotlistDTO(
    UUID id,
    UserDTO owner,
    Template template,
    List<SceneDTO> scenes,
    List<SceneAttributeDefinitionBaseDTO> sceneAttributeDefinitions,
    List<ShotAttributeDefinitionBaseDTO> shotAttributeDefinitions,
    Integer sceneCount,
    Integer shotCount,
    Integer sceneAttributeDefinitionCount,
    Integer shotAttributeDefinitionCount,
    List<CollaborationDTO> collaborations,
    Integer collaboratorCount,
    String name,
    ZonedDateTime createdAt,
    ZonedDateTime editedAt
) { }
