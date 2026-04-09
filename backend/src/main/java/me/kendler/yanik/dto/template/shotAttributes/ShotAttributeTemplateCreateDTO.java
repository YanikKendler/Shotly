package me.kendler.yanik.dto.template.shotAttributes;

import me.kendler.yanik.model.shot.ShotAttributeType;

import java.util.UUID;

public record ShotAttributeTemplateCreateDTO(
    UUID templateId,
    ShotAttributeType type
){ }
