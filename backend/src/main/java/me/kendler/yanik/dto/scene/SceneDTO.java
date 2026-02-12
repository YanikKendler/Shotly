package me.kendler.yanik.dto.scene;

import me.kendler.yanik.dto.scene.attributes.SceneAttributeBaseDTO;
import me.kendler.yanik.dto.shot.ShotDTO;
import me.kendler.yanik.model.Shotlist;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record SceneDTO (
    UUID id,
    List<SceneAttributeBaseDTO> attributes,
    List<ShotDTO> shots,
    Integer position,
    ZonedDateTime createdAt,
    Integer shotCount
){ }
