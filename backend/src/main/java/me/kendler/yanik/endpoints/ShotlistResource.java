package me.kendler.yanik.endpoints;

import io.quarkus.panache.common.Sort;
import io.smallrye.graphql.api.Subscription;
import io.smallrye.mutiny.Multi;
import jakarta.inject.Inject;
import me.kendler.yanik.auth.AdminAccessService;
import me.kendler.yanik.auth.ShotlistAccessService;
import me.kendler.yanik.dto.shotlist.*;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationCreateDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationEditDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.User;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.CollaborationRepository;
import me.kendler.yanik.repositories.ShotlistRepository;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.socket.ShotlistSyncService;
import me.kendler.yanik.socket.ShotlistUpdateDTO;
import me.kendler.yanik.socket.ShotlistUpdateType;
import me.kendler.yanik.socket.payload.CollaborationPayload;
import me.kendler.yanik.socket.payload.ShotlistPayload;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;

@GraphQLApi
@RateLimited()
public class ShotlistResource {
    private static final Logger log = LoggerFactory.getLogger(ShotlistResource.class);
    @Inject
    JsonWebToken jwt;

    @Inject
    ShotlistRepository shotlistRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    ShotlistSyncService syncService;

    @Inject
    ShotlistAccessService accessService;

    @Inject
    AdminAccessService adminAccessService;

    @Query
    public ShotlistCollection getShotlists() {
        return shotlistRepository.findAllForUser(jwt, false);
    }

    @Query
    public ShotlistCollection getArchivedShotlists() {
        return shotlistRepository.findAllForUser(jwt, true);
    }

    @Query
    public List<ShotlistDTO> getAllShotlists() {
        adminAccessService.check(jwt);

        return shotlistRepository
                .findAll(Sort.descending("name"))
                .list()
                .stream()
                .map(Shotlist::toDTO)
                .toList();
    }

    @Query
    public ShotlistDTO getShotlist(UUID id) {
        accessService.checkView(shotlistRepository.findByIdValidated(id), jwt);

        return shotlistRepository.findAsDTO(id);
    }

    @Mutation
    public ShotlistDTO createShotlist(ShotlistCreateDTO createDTO) {
        return shotlistRepository.create(createDTO, jwt);
    }

    @Mutation
    public ShotlistDTO updateShotlist(ShotlistEditDTO editDTO) {
        Shotlist affectedShotlist = shotlistRepository.findByIdValidated(editDTO.id());
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkEdit(affectedShotlist, user);

        ShotlistDTO result = shotlistRepository.update(editDTO);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SHOTLIST_UPDATED,
                user.id,
                new ShotlistPayload(
                    result.toMinimalDTO()
                )
            )
        );

        return result;
    }

    @Mutation
    public ShotlistDTO updateShotlistAsOwner(ShotlistEditAsOwnerDTO editDTO) {
        Shotlist affectedShotlist = shotlistRepository.findByIdValidated(editDTO.id());
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkOwner(affectedShotlist, user);

        ShotlistDTO result = shotlistRepository.updateAsOwner(editDTO);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SHOTLIST_UPDATED,
                user.id,
                new ShotlistPayload(
                    result.toMinimalDTO()
                )
            )
        );

        return result;
    }

    @Mutation
    public ShotlistDTO deleteShotlist(UUID id) {
        Shotlist affectedShotlist = shotlistRepository.findByIdValidated(id);
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkOwner(affectedShotlist, user);

        ShotlistDTO result = shotlistRepository.delete(id);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SHOTLIST_DELETED,
                user.id,
                new ShotlistPayload(
                    result.toMinimalDTO()
                )
            )
        );

        return result;
    }

    /*
    * COLLABORATIONS
    */

    @Inject
    CollaborationRepository collaborationRepository;

    @Query
    public List<CollaborationDTO> getPendingCollaborations(){
        return collaborationRepository.getPendingByJWT(jwt);
    }

    @Mutation
    public CollaborationDTO acceptOrDeclineCollaboration(CollaborationEditDTO editDTO){
        return collaborationRepository.acceptOrDecline(editDTO.id(), editDTO.collaborationState(), jwt);
    }

    @Mutation
    @RateLimited("medium")
    public List<CollaborationDTO> addCollaboration(CollaborationCreateDTO createDTO){
        Shotlist affectedShotlist = shotlistRepository.findByIdValidated(createDTO.shotlistId());

        accessService.checkOwner(affectedShotlist, jwt);

        return collaborationRepository.create(createDTO, jwt);
    }

    @Mutation
    public CollaborationDTO editCollaboration(CollaborationEditDTO editDTO) {
        Shotlist affectedShotlist = collaborationRepository.findById(editDTO.id()).shotlist;
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkOwner(affectedShotlist, user);

        CollaborationDTO result = collaborationRepository.update(editDTO);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.COLLABORATION_TYPE_UPDATED,
                user.id,
                new CollaborationPayload(
                    result.user().id(),
                    result.collaborationType()
                )
            )
        );

        return result;
    }

    @Mutation
    public CollaborationDTO deleteCollaboration(UUID id){
        Shotlist affectedShotlist = collaborationRepository.findById(id).shotlist;
        accessService.checkOwner(affectedShotlist, jwt);

        CollaborationDTO result = collaborationRepository.delete(id);

        syncService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.COLLABORATION_DELETED,
                        userRepository.findOrCreateByJWT(jwt).id,
                        new CollaborationPayload(
                                result.user().id(),
                                result.collaborationType()
                        )
                )
        );

        return result;
    }

    @Mutation
    public CollaborationDTO leaveCollaboration(UUID shotlistId){
        Shotlist affectedShotlist = shotlistRepository.findById(shotlistId);

        CollaborationDTO result = collaborationRepository.leave(affectedShotlist.id, jwt);

        syncService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.COLLABORATION_DELETED,
                        userRepository.findOrCreateByJWT(jwt).id,
                        new CollaborationPayload(
                                result.user().id(),
                                result.collaborationType()
                        )
                )
        );

        return result;
    }

    @Mutation
    public CollaborationDTO refreshCollaboration(UUID id){
        accessService.checkOwner(collaborationRepository.findById(id).shotlist, jwt);

        return collaborationRepository.refresh(id);
    }
}
