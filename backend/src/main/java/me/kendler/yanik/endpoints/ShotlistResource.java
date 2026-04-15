package me.kendler.yanik.endpoints;

import io.quarkus.panache.common.Sort;
import jakarta.inject.Inject;
import me.kendler.yanik.dto.shotlist.*;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationCreateDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationEditDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.CollaborationRepository;
import me.kendler.yanik.repositories.ShotlistRepository;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.socket.ShotlistUpdateDTO;
import me.kendler.yanik.socket.ShotlistUpdateType;
import me.kendler.yanik.socket.ShotlistWebsocketService;
import me.kendler.yanik.socket.payload.CollaborationPayload;
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
    ShotlistWebsocketService shotlistWebsocketService;

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
        userRepository.checkAdmin(jwt);

        return shotlistRepository.findAll(Sort.descending("name")).list().stream().map(Shotlist::toDTO).toList();
    }

    @Query
    public ShotlistDTO getShotlist(UUID id) {
        userRepository.checkShotlistViewRights(shotlistRepository.findByIdValidated(id), jwt);

        return shotlistRepository.findAsDTO(id);
    }

    @Mutation
    public ShotlistDTO createShotlist(ShotlistCreateDTO createDTO) {
        return shotlistRepository.create(createDTO, jwt);
    }

    @Mutation
    public ShotlistDTO updateShotlist(ShotlistEditDTO editDTO) {
        userRepository.checkShotlistEditRights(shotlistRepository.findByIdValidated(editDTO.id()), jwt);
        //TODO add collaboration support
        return shotlistRepository.update(editDTO);
    }

    @Mutation
    public ShotlistDTO updateShotlistAsOwner(ShotlistEditAsOwnerDTO editDTO) {
        userRepository.checkShotlistOwner(shotlistRepository.findByIdValidated(editDTO.id()), jwt);
        //TODO add collaboration support
        return shotlistRepository.updateAsOwner(editDTO);
    }

    @Mutation
    public ShotlistDTO deleteShotlist(UUID id) {
        userRepository.checkShotlistOwner(shotlistRepository.findByIdValidated(id), jwt);
        //TODO add collaboration support
        return shotlistRepository.delete(id);
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
        userRepository.checkShotlistOwner(shotlistRepository.findByIdValidated(createDTO.shotlistId()), jwt);

        return collaborationRepository.create(createDTO, jwt);
    }

    @Mutation
    public CollaborationDTO editCollaboration(CollaborationEditDTO editDTO) {
        Shotlist affectedShotlist = collaborationRepository.findById(editDTO.id()).shotlist;
        userRepository.checkShotlistOwner(affectedShotlist, jwt);

        CollaborationDTO result = collaborationRepository.update(editDTO);

        shotlistWebsocketService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.COLLABORATION_TYPE_UPDATED,
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
    public CollaborationDTO deleteCollaboration(UUID id){
        Shotlist affectedShotlist = collaborationRepository.findById(id).shotlist;
        userRepository.checkShotlistOwner(affectedShotlist, jwt);

        CollaborationDTO result = collaborationRepository.delete(id);

        shotlistWebsocketService.broadcast(
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

        shotlistWebsocketService.broadcast(
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
        userRepository.checkShotlistOwner(collaborationRepository.findById(id).shotlist, jwt);

        return collaborationRepository.refresh(id);
    }
}
