package me.kendler.yanik.dto.template.sceneAttributes;

import me.kendler.yanik.model.scene.SceneAttributeType;

import java.util.UUID;

public record SceneAttributeTemplateCreateDTO(
    UUID templateId,
    SceneAttributeType type
){ }
