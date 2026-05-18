package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.auth.ShotlistAccessService;
import me.kendler.yanik.dto.comment.CommentCreateDTO;
import me.kendler.yanik.dto.comment.CommentDTO;
import me.kendler.yanik.dto.comment.CommentEditDTO;
import me.kendler.yanik.model.Comment;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.User;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.CommentRepository;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.repositories.shot.ShotRepository;
import me.kendler.yanik.socket.ShotlistSyncService;
import me.kendler.yanik.socket.ShotlistUpdateDTO;
import me.kendler.yanik.socket.ShotlistUpdateType;
import me.kendler.yanik.socket.payload.CommentPayload;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@GraphQLApi
@RateLimited()
@Transactional
public class CommentResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    UserRepository userRepository;

    @Inject
    CommentRepository commentRepository;

    @Inject
    ShotRepository shotRepository;

    @Inject
    ShotlistSyncService syncService;

    @Inject
    ShotlistAccessService accessService;

    @Query
    public List<CommentDTO> getComments(UUID shotId){
        Shot affectedShot = shotRepository.findByIdValidated(shotId);

        accessService.checkView(affectedShot.scene.shotlist, jwt);

        return affectedShot.comments.stream()
                .filter(c -> !c.isArchived)
                .sorted(Comparator.comparing(c -> c.createdAt))
                .map(Comment::toDTO)
                .toList();
    }

    @Query
    public List<CommentDTO> getArchivedComments(UUID shotId){
        Shot affectedShot = shotRepository.findByIdValidated(shotId);
        accessService.checkView(affectedShot.scene.shotlist, jwt);

        return affectedShot.comments.stream()
                .filter(c -> c.isArchived)
                .sorted(Comparator.comparing( c -> c.createdAt))
                .map(Comment::toDTO)
                .toList();
    }

    @Mutation
    public CommentDTO addComment(CommentCreateDTO createDTO){
        Shotlist affectedShotlist = shotRepository.findByIdValidated(createDTO.shotId()).scene.shotlist;
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkEdit(affectedShotlist, user);

        CommentDTO result = commentRepository.create(createDTO, jwt);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.COMMENT_ADDED,
                user.id,
                new CommentPayload(result)
        ));

        return result;
    }

    @Mutation
    public CommentDTO updateComment(CommentEditDTO updateDTO){
        Comment affectedComment = commentRepository.findById(updateDTO.id());
        Shotlist affectedShotlist = affectedComment.shot.scene.shotlist;
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkEdit(affectedShotlist, user);

        CommentDTO result = commentRepository.update(updateDTO);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                    updateDTO.text() != null ? ShotlistUpdateType.COMMENT_TEXT : ShotlistUpdateType.COMMENT_ARCHIVAL,
                    user.id,
                    new CommentPayload(result)
            )
        );

        return result;
    }
}
