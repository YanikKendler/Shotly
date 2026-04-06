package me.kendler.yanik.model.shot;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import me.kendler.yanik.dto.shot.ShotDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributes.ShotAttributeBase;
import org.hibernate.annotations.BatchSize;

@Entity
public class Shot extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;
    @ManyToOne
    @JsonIgnore
    public Scene scene;
    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 5)
    public Set<ShotAttributeBase> attributes = new HashSet<>();
    public int position;
    public boolean isSubshot;
    public ZonedDateTime createdAt;

    public Shot() {
        this.createdAt = ZonedDateTime.now(ZoneOffset.UTC);
    }

    public Shot(Scene scene) {
        this();
        this.scene = scene;
        this.position = scene.shots.size();
        scene.shots.add(this);
        for(ShotAttributeDefinitionBase attributeDefinition : scene.shotlist.shotAttributeDefinitions) {
            ShotAttributeBase attribute = attributeDefinition.createAttribute(this);
            persist(attribute);
            attributes.add(attribute);
        }
    }

    public ShotDTO toDTO() {
        return new ShotDTO(
            this.id,
            this.scene.id,
            this.attributes.stream()
                    .sorted(Comparator.comparingInt(attr -> attr.definition.position))
                    .map(ShotAttributeBase::toDTO)
                    .collect(Collectors.toList()),
            this.position,
            this.isSubshot,
            this.createdAt
        );
    }
}