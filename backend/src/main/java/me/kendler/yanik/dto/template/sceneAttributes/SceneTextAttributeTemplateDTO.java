package me.kendler.yanik.dto.template.sceneAttributes;

public record SceneTextAttributeTemplateDTO(
    Long id,
    String name,
    int position
) implements SceneAttributeTemplateBaseDTO {
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
