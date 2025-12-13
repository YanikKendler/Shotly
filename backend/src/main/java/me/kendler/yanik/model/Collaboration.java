package me.kendler.yanik.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;

import java.util.UUID;

@Entity
public class Collaboration extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;
    @ManyToOne
    public User user;
    @ManyToOne
    @JsonIgnore
    public Shotlist shotlist;
    @Enumerated(EnumType.STRING)
    public CollaborationType collaborationType = CollaborationType.VIEW;
    @Enumerated(EnumType.STRING)
    public CollaborationState collaborationState = CollaborationState.PENDING;

    public Collaboration() { }

    public Collaboration(User user, Shotlist shotlist) {
        this.user = user;
        this.shotlist = shotlist;
    }

    public CollaborationDTO toDTO() {
        return new CollaborationDTO(
            id,
            user.toDTO(),
                collaborationType,
            collaborationState,
            shotlist
        );
    }
}

