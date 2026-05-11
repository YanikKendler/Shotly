package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import me.kendler.yanik.dto.comment.CommentCreateDTO;
import me.kendler.yanik.dto.comment.CommentDTO;
import me.kendler.yanik.dto.comment.CommentEditDTO;
import me.kendler.yanik.model.Comment;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.CommentRepository;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.repositories.shot.ShotRepository;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

@GraphQLApi
@RateLimited()
public class CommentResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    UserRepository userRepository;

    @Inject
    CommentRepository commentRepository;

    @Inject
    ShotRepository shotRepository;

    @Query
    public List<CommentDTO> getComments(UUID shotId){
        Shot affectedShot = shotRepository.findByIdValidated(shotId);

        userRepository.checkShotlistViewRights(affectedShot.scene.shotlist, jwt);

        return affectedShot.comments.stream().filter(c -> !c.isArchived).map(Comment::toDTO).toList();
    }

    @Query
    public List<CommentDTO> getArchivedComments(UUID shotId){
        Shot affectedShot = shotRepository.findByIdValidated(shotId);
        userRepository.checkShotlistViewRights(affectedShot.scene.shotlist, jwt);

        return affectedShot.comments.stream().filter(c -> c.isArchived).map(Comment::toDTO).toList();
    }

    @Mutation
    public CommentDTO addComment(CommentCreateDTO createDTO){
        Shotlist affectedShotlist = shotRepository.findByIdValidated(createDTO.shotId()).scene.shotlist;
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        CommentDTO result = commentRepository.create(createDTO, jwt);

        //TODO socket broadcast

        return result;
    }

    @Mutation
    public CommentDTO updateComment(CommentEditDTO updateDTO){
        Comment affectedComment = commentRepository.findById(updateDTO.id());
        Shotlist affectedShotlist = affectedComment.shot.scene.shotlist;
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        CommentDTO result = commentRepository.update(updateDTO);

        //TODO socket broadcast

        return result;
    }
}
