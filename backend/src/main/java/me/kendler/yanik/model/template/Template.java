package me.kendler.yanik.model.template;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import me.kendler.yanik.dto.template.TemplateDTO;
import me.kendler.yanik.model.template.sceneAttributes.SceneAttributeTemplateBase;
import me.kendler.yanik.model.template.shotAttributes.ShotAttributeTemplateBase;
import me.kendler.yanik.model.User;
import org.hibernate.annotations.BatchSize;

@Entity
public class Template extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;
    @ManyToOne
    @JsonIgnore
    public User owner;
    @OneToMany(mappedBy = "template", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    @BatchSize(size = 5)
    public Set<SceneAttributeTemplateBase> sceneAttributes = new HashSet<>();
    @OneToMany(mappedBy = "template", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    @BatchSize(size = 5)
    public Set<ShotAttributeTemplateBase> shotAttributes = new HashSet<>();
    public String name;
    public ZonedDateTime createdAt;

    public Template() {
        this.createdAt = ZonedDateTime.now(ZoneOffset.UTC);
    }

    public Template(User owner, String name) {
        this();
        this.owner = owner;
        this.name = name;
    }

    public TemplateDTO toDTO(){
        return new TemplateDTO(
            id,
            owner.toDTO(),
            name,
            sceneAttributes.stream().sorted(Comparator.comparingInt(attr -> attr.position)).map(SceneAttributeTemplateBase::toDTO).toList(),
            shotAttributes.stream().sorted(Comparator.comparingInt(attr -> attr.position)).map(ShotAttributeTemplateBase::toDTO).toList(),
            createdAt,
            sceneAttributes.size(),
            shotAttributes.size()
        );
    }
}