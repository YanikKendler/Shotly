package me.kendler.yanik.dto.template.shotAttributes;

import io.smallrye.graphql.api.Nullable;

public record ShotAttributeTemplateEditDTO(
    Long id,
    @Nullable String name,
    @Nullable Integer position
) { }
