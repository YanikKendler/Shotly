package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import me.kendler.yanik.dto.shot.*;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shot.attributes.ShotAttributeBaseDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSelectAttributeOptionDefinition;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.repositories.scene.SceneRepository;
import me.kendler.yanik.repositories.shot.ShotAttributeDefinitionRepository;
import me.kendler.yanik.repositories.shot.ShotAttributeRepository;
import me.kendler.yanik.repositories.shot.ShotRepository;
import me.kendler.yanik.repositories.shot.ShotSelectAttributeOptionDefinitionRepository;
import me.kendler.yanik.socket.ShotlistUpdateDTO;
import me.kendler.yanik.socket.ShotlistUpdateType;
import me.kendler.yanik.socket.ShotlistWebsocketService;
import me.kendler.yanik.socket.payload.ShotDetailPayload;
import me.kendler.yanik.socket.payload.ShotSelectOptionPayload;
import me.kendler.yanik.socket.payload.ShotAttributePayload;
import me.kendler.yanik.socket.payload.ShotPayload;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@GraphQLApi
@RateLimited()
public class ShotResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    ShotRepository shotRepository;

    @Inject
    SceneRepository sceneRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    ShotlistWebsocketService shotlistWebsocketService;

    private static final Logger LOGGER = Logger.getLogger(ShotResource.class);

    @Query
    public List<ShotDTO> getShots(UUID sceneId) {
        userRepository.checkShotlistViewRights(sceneRepository.findByIdValidated(sceneId).shotlist, jwt);

        return shotRepository.findAllForScene(sceneId);
    }

    @Mutation
    public ShotDTO createShot(@PathParam("sceneId") UUID sceneId){
        Shotlist affectedShotlist = sceneRepository.findByIdValidated(sceneId).shotlist;
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        ShotDTO result = shotRepository.create(sceneId);

        shotlistWebsocketService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                    ShotlistUpdateType.SHOT_ADDED,
                    userRepository.findOrCreateByJWT(jwt).id,
                    new ShotDetailPayload(
                        result
                    )
                )
        );

        return result;
    }

    @Mutation
    public ShotDTO deleteShot(@PathParam("id") UUID id) {
        Shotlist affectedShotlist = shotRepository.findByIdValidated(id).scene.shotlist;

        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        ShotDTO result = shotRepository.delete(id);

        shotlistWebsocketService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                    ShotlistUpdateType.SHOT_DELETED,
                    userRepository.findOrCreateByJWT(jwt).id,
                    new ShotPayload(
                        result
                    )
                )
        );

        return result;
    }

    @Mutation
    public ShotDTO updateShot(ShotEditDTO editDTO) {
        Shotlist affectedShotlist = shotRepository.findByIdValidated(editDTO.id()).scene.shotlist;
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        ShotDTO result = shotRepository.update(editDTO);

        shotlistWebsocketService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SHOT_UPDATED,
                userRepository.findOrCreateByJWT(jwt).id,
                new ShotPayload(
                    result
                )
            )
        );

        return result;
    }

    /*
     * ATTRIBUTE DEFINITIONS
     */

    @Inject
    ShotAttributeDefinitionRepository shotAttributeDefinitionRepository;

    @Query
    public List<ShotAttributeDefinitionBaseDTO> getShotAttributeDefinitions(UUID shotlistId){
        userRepository.checkShotlistViewRights(shotlistId, jwt);

        return shotAttributeDefinitionRepository.getAll(shotlistId);
    }

    @Mutation
    public ShotAttributeDefinitionBaseDTO createShotAttributeDefinition(ShotAttributeDefinitionCreateDTO createDTO){
        userRepository.checkShotlistEditRights(createDTO.shotlistId(), jwt);

        return shotAttributeDefinitionRepository.create(createDTO);
    }

    @Mutation
    public ShotAttributeDefinitionBaseDTO deleteShotAttributeDefinition(Long id){
        userRepository.checkShotlistEditRights(shotAttributeDefinitionRepository.getShotlistByDefinitionId(id), jwt);

        return shotAttributeDefinitionRepository.delete(id);
    }

    @Mutation
    public ShotAttributeDefinitionBaseDTO updateShotAttributeDefinition(ShotAttributeDefinitionEditDTO editDTO) {
        userRepository.checkShotlistEditRights(shotAttributeDefinitionRepository.getShotlistByDefinitionId(editDTO.id()), jwt);

        return shotAttributeDefinitionRepository.update(editDTO);
    }

    /*
     * ATTRIBUTES
     */

    @Inject
    ShotAttributeRepository shotAttributeRepository;

    @Mutation
    public ShotAttributeBaseDTO updateShotAttribute(ShotAttributeEditDTO editDTO) {
        Shot shot = shotAttributeRepository.getShotByAttributeId(editDTO.id());
        Shotlist affectedShotlist = shot.scene.shotlist;

        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        ShotAttributeBaseDTO result = shotAttributeRepository.update(editDTO);

        shotlistWebsocketService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.SHOT_ATTRIBUTE_UPDATED,
                        userRepository.findOrCreateByJWT(jwt).id,
                        new ShotAttributePayload(
                            result,
                            shot.id,
                            shot.scene.id
                        )
                )
        );

        return result;
    }

    /*
     * SELECT OPTIONS
     */

    @Inject
    ShotSelectAttributeOptionDefinitionRepository shotSelectAttributeOptionDefinitionRepository;

    @Query
    public List<ShotSelectAttributeOptionDefinition> getShotSelectAttributeOptions(Long attributeDefinitionId) {
        userRepository.checkShotlistViewRights(shotAttributeDefinitionRepository.getShotlistByDefinitionId(attributeDefinitionId), jwt);

        return shotSelectAttributeOptionDefinitionRepository.list("shotAttributeDefinition.id = ?1 order by name", attributeDefinitionId);
    }

    @Query
    public List<ShotSelectAttributeOptionDefinition> searchShotSelectAttributeOptions(ShotSelectAttributeOptionSearchDTO searchDTO){
        userRepository.checkShotlistViewRights(shotAttributeDefinitionRepository.getShotlistByDefinitionId(searchDTO.shotAttributeDefinitionId()), jwt);

        return shotSelectAttributeOptionDefinitionRepository.search(searchDTO);
    }

    @Mutation
    public ShotSelectAttributeOptionDefinition createShotSelectAttributeOption(ShotSelectAttributeOptionCreateDTO createDTO) {
        Shotlist affectedShotlist = shotAttributeDefinitionRepository.getShotlistByDefinitionId(createDTO.attributeDefinitionId());
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        ShotSelectAttributeOptionDefinition result = shotSelectAttributeOptionDefinitionRepository.create(createDTO);

        shotlistWebsocketService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SHOT_SELECT_OPTION_CREATED,
                userRepository.findOrCreateByJWT(jwt).id,
                new ShotSelectOptionPayload(
                    result
                )
            )
        );

        return result;
    }

    @Mutation
    public ShotSelectAttributeOptionDefinition deleteShotSelectAttributeOption(Long id){
        ShotAttributeDefinitionBase shotAttributeDefinitionBase = shotSelectAttributeOptionDefinitionRepository.findById(id).shotAttributeDefinition;
        userRepository.checkShotlistEditRights(shotAttributeDefinitionRepository.getShotlistByDefinitionId(shotAttributeDefinitionBase.id), jwt);

        return shotSelectAttributeOptionDefinitionRepository.delete(id);
    }

    @Mutation
    public ShotSelectAttributeOptionDefinition updateShotSelectAttributeOption(ShotSelectAttributeOptionEditDTO editDTO) {
        ShotAttributeDefinitionBase shotAttributeDefinitionBase = shotSelectAttributeOptionDefinitionRepository.findById(editDTO.id()).shotAttributeDefinition;
        userRepository.checkShotlistEditRights(shotAttributeDefinitionRepository.getShotlistByDefinitionId(shotAttributeDefinitionBase.id), jwt);

        return shotSelectAttributeOptionDefinitionRepository.update(editDTO);
    }
}
