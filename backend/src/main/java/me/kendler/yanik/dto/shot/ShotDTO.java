package me.kendler.yanik.dto.shot;

import me.kendler.yanik.dto.scene.SceneDTO;
import me.kendler.yanik.dto.shot.attributes.ShotAttributeBaseDTO;
import me.kendler.yanik.model.scene.Scene;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record ShotDTO (
    UUID id,
    UUID sceneId,
    List<ShotAttributeBaseDTO> attributes,
    int position,
    boolean isSubshot,
    ZonedDateTime createdAt
){ }
