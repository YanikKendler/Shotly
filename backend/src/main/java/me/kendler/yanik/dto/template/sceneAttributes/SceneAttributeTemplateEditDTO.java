package me.kendler.yanik.dto.template.sceneAttributes;

import io.smallrye.graphql.api.Nullable;

public record SceneAttributeTemplateEditDTO(
    Long id,
    @Nullable String name,
    @Nullable Integer position
) { }
