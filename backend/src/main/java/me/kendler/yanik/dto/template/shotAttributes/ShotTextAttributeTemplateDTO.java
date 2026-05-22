package me.kendler.yanik.dto.template.shotAttributes;

public record ShotTextAttributeTemplateDTO(
    Long id,
    String name,
    int position
) implements ShotAttributeTemplateBaseDTO {
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
