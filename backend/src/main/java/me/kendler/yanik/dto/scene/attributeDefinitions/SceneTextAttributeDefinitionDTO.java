package me.kendler.yanik.dto.scene.attributeDefinitions;

public record SceneTextAttributeDefinitionDTO(
    Long id,
    String name,
    int position
) implements SceneAttributeDefinitionBaseDTO {
    @Override
    public Long getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public int getPosition() {
        return position;
    }
}
