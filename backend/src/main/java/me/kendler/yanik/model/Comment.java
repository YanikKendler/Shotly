package me.kendler.yanik.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import me.kendler.yanik.dto.comment.CommentDTO;
import me.kendler.yanik.model.shot.Shot;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "comment")
public class Comment extends PanacheEntityBase {
    @Id
    public UUID id;
    @ManyToOne
    public Shot shot;
    @ManyToOne
    public User user;
    public String text;
    public boolean isArchived = false;
    public boolean isEdited = false;
    public ZonedDateTime createdAt;
    public ZonedDateTime editedAt;

    public Comment() {
        this.createdAt = ZonedDateTime.now(ZoneOffset.UTC);
        this.editedAt = ZonedDateTime.now(ZoneOffset.UTC);
    }

    public Comment(UUID id, Shot shot, User user, String text) {
        this();
        this.id = id;
        this.shot = shot;
        this.user = user;
        this.text = text;
    }

    public CommentDTO toDTO() {
        return new CommentDTO(
            this.id,
            this.shot.id,
            this.shot.scene.id,
            this.user.toMinimalDTO(),
            this.text,
            this.isArchived,
            this.isEdited,
            this.createdAt,
            this.editedAt
        );
    }
}