package me.kendler.yanik.model.scene;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import me.kendler.yanik.dto.scene.SceneDTO;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributes.SceneAttributeBase;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.Shotlist;
import org.hibernate.annotations.BatchSize;

@Entity
public class Scene extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;
    @ManyToOne
    @JsonIgnore
    public Shotlist shotlist;
    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 5)
    public Set<SceneAttributeBase> attributes = new HashSet<>();
    @OneToMany(mappedBy = "scene", fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    public Set<Shot> shots = new HashSet<>();
    public int position;
    public ZonedDateTime createdAt;

    public Scene() {
        this.createdAt = ZonedDateTime.now(ZoneOffset.UTC);
    }

    public Scene(Shotlist shotlist) {
        this();
        this.shotlist = shotlist;
        this.position = shotlist.scenes.size();
        shotlist.scenes.add(this);

        // create attribute instances based on all the attribute definitions stored in the shotlist
        for (SceneAttributeDefinitionBase attributeDefinition : shotlist.sceneAttributeDefinitions) {
            SceneAttributeBase attribute = attributeDefinition.createAttribute(this);
            this.attributes.add(attribute);
            persist(attribute);
        }
    }

    public SceneDTO toDTO() {
        return new SceneDTO(
            this.id,
            this.attributes.stream()
                    .sorted(Comparator.comparingInt(attr -> attr.definition.position))
                    .map(SceneAttributeBase::toDTO)
                    .collect(Collectors.toList()),
            this.shots.stream()
                    .sorted(Comparator.comparingInt(shot -> shot.position))
                    .map(Shot::toDTO)
                    .collect(Collectors.toList()),
            this.position,
            this.createdAt,
            this.shots.size()
        );
    }
}