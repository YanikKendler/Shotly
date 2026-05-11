package me.kendler.yanik.repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import me.kendler.yanik.dto.comment.CommentCreateDTO;
import me.kendler.yanik.dto.comment.CommentDTO;
import me.kendler.yanik.dto.comment.CommentEditDTO;
import me.kendler.yanik.model.Comment;
import me.kendler.yanik.model.User;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.repositories.shot.ShotRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.ZonedDateTime;
import java.util.UUID;

@ApplicationScoped
public class CommentRepository implements PanacheRepositoryBase<Comment, UUID> {
    @Inject
    UserRepository userRepository;

    @Inject
    ShotRepository shotRepository;

    public CommentDTO create(CommentCreateDTO createDTO, JsonWebToken jwt){
        Shot shot = shotRepository.findByIdValidated(createDTO.id());
        User user = userRepository.findOrCreateByJWT(jwt);

        Comment comment = new Comment(
            createDTO.id(),
            shot,
            user,
            createDTO.text()
        );

        shot.scene.shotlist.registerEdit();

        persist(comment);

        return comment.toDTO();
    }

    public CommentDTO update(CommentEditDTO editDTO){
        Comment comment = findById(editDTO.id());

        if(editDTO.text() != null){
            comment.text = editDTO.text();
        }
        if(editDTO.isArchived() != null) {
            comment.isArchived = editDTO.isArchived();
        }

        comment.isEdited = true;
        comment.editedAt = ZonedDateTime.now();

        comment.shot.scene.shotlist.registerEdit();

        persist(comment);

        return comment.toDTO();
    }
}
