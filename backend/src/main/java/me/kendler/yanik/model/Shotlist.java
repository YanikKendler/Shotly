package me.kendler.yanik.model;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shotlist.ShotlistDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.model.template.sceneAttributes.SceneAttributeTemplateBase;
import me.kendler.yanik.model.template.shotAttributes.ShotAttributeTemplateBase;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "shotlist")
public class Shotlist extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;
    @ManyToOne
    @JsonIgnore
    public User owner;
    @ManyToOne()
    public Template template;

    @OneToMany(mappedBy = "shotlist", fetch = FetchType.LAZY)
    @BatchSize(size = 10)
    public Set<Scene> scenes = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 5)
    public Set<SceneAttributeDefinitionBase> sceneAttributeDefinitions = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 5)
    public Set<ShotAttributeDefinitionBase> shotAttributeDefinitions = new HashSet<>();

    @OneToMany(mappedBy = "shotlist", fetch = FetchType.LAZY)
    @BatchSize(size = 5)
    public Set<Collaboration> collaborations = new HashSet<>();

    public String name;

    public boolean isArchived = false;

    public ZonedDateTime createdAt;
    public ZonedDateTime editedAt;

    public Shotlist() {
        this.createdAt = ZonedDateTime.now(ZoneOffset.UTC);
        this.editedAt = ZonedDateTime.now(ZoneOffset.UTC);
    }

    public Shotlist(User owner, String name) {
        this();
        this.owner = owner;
        owner.shotlists.add(this);
        this.name = name;
    }

    public Shotlist(User owner, Template template, String name) {
        this(owner, name);

        this.template = template;

        //copy all scene attributes from the template
        for (SceneAttributeTemplateBase sceneAttributeTemplate : template.sceneAttributes) {
            SceneAttributeDefinitionBase attributeDefinition = sceneAttributeTemplate.createDefinition(this);
            persist(attributeDefinition);
            sceneAttributeDefinitions.add(attributeDefinition);
        }

        //copy all shot attributes from the template
        for (ShotAttributeTemplateBase shotAttributeTemplate : template.shotAttributes) {
            ShotAttributeDefinitionBase attributeDefinition = shotAttributeTemplate.createDefinition(this);
            persist(attributeDefinition);
            shotAttributeDefinitions.add(attributeDefinition);
        }
    }

    public void registerEdit() {
        this.editedAt = ZonedDateTime.now(ZoneOffset.UTC);
    }

    public ShotlistDTO toDTO() {
        return new ShotlistDTO(
            this.id,
            this.owner.toDTO(),
            this.template,
            this.scenes.stream()
                    .sorted(Comparator.comparingInt(scene -> scene.position))
                    .map(Scene::toDTO)
                    .collect(Collectors.toList()),
            this.sceneAttributeDefinitions.stream()
                    .map(SceneAttributeDefinitionBase::toDTO)
                    .sorted(Comparator.comparingInt(SceneAttributeDefinitionBaseDTO::getPosition))
                    .collect(Collectors.toList()),
            this.shotAttributeDefinitions.stream()
                    .map(ShotAttributeDefinitionBase::toDTO)
                    .sorted(Comparator.comparingInt(ShotAttributeDefinitionBaseDTO::getPosition))
                    .collect(Collectors.toList()),
            this.scenes.size(),
            this.scenes.stream().map(scene -> scene.shots.size()).reduce(0, Integer::sum),
            this.sceneAttributeDefinitions.size(),
            this.shotAttributeDefinitions.size(),
            this.collaborations.stream()
                    .sorted(Comparator.comparing( c -> c.user.name.toUpperCase()))
                    .map(Collaboration::toDTO)
                    .collect(Collectors.toList()),
            this.collaborations.size(),
            this.name,
            this.isArchived,
            this.createdAt,
            this.editedAt
        );
    }

    @Override
    public String toString() {
        return "Shotlist{" +
            "id=" + id +
            ", owner=" + owner +
            ", template=" + template +
            ", scenes=" + scenes +
            ", sceneAttributeDefinitions=" + sceneAttributeDefinitions +
            ", shotAttributeDefinitions=" + shotAttributeDefinitions +
            ", name='" + name + '\'' +
            ", createdAt=" + createdAt +
            ", editedAt=" + editedAt +
            '}';
    }
}