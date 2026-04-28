package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import me.kendler.yanik.dto.scene.*;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.scene.attributes.SceneAttributeBaseDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.repositories.scene.SceneAttributeDefinitionRepository;
import me.kendler.yanik.repositories.scene.SceneAttributeRepository;
import me.kendler.yanik.repositories.scene.SceneRepository;
import me.kendler.yanik.repositories.scene.SceneSelectAttributeOptionDefinitionRepository;
import me.kendler.yanik.socket.ShotlistUpdateDTO;
import me.kendler.yanik.socket.ShotlistUpdateType;
import me.kendler.yanik.socket.ShotlistWebsocketService;
import me.kendler.yanik.socket.payload.SceneDetailPayload;
import me.kendler.yanik.socket.payload.SceneSelectOptionPayload;
import me.kendler.yanik.socket.payload.SceneAttributePayload;
import me.kendler.yanik.socket.payload.ScenePayload;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

@GraphQLApi
@RateLimited()
public class SceneResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    SceneRepository sceneRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    ShotlistWebsocketService shotlistWebsocketService;

    @Query
    public List<SceneDTO> getScenes(UUID shotlistId) {
        userRepository.checkShotlistViewRights(shotlistId, jwt);

        return sceneRepository.listAllForShotlist(shotlistId);
    }

    @Mutation
    public SceneDTO createScene(UUID shotlistId) {
        userRepository.checkShotlistEditRights(shotlistId, jwt);

        SceneDTO result = sceneRepository.create(shotlistId);

        shotlistWebsocketService.broadcast(
                shotlistId,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.SCENE_ADDED,
                        userRepository.findOrCreateByJWT(jwt).id,
                        new SceneDetailPayload(
                                result
                        )
                )
        );

        return result;
    }

    @Mutation
    public SceneDTO deleteScene(UUID id) {
        Shotlist affectedShotlist = sceneRepository.findByIdValidated(id).shotlist;
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        SceneDTO result = sceneRepository.delete(id);

        shotlistWebsocketService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.SCENE_DELETED,
                        userRepository.findOrCreateByJWT(jwt).id,
                        new ScenePayload(
                                result
                        )
                )
        );

        return result;
    }

    @Mutation
    public SceneDTO updateScene(SceneEditDTO editDTO) {
        Shotlist affectedShotlist = sceneRepository.findByIdValidated(editDTO.id()).shotlist;
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        SceneDTO result = sceneRepository.update(editDTO);

        shotlistWebsocketService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.SCENE_UPDATED,
                        userRepository.findOrCreateByJWT(jwt).id,
                        new ScenePayload(
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
    SceneAttributeDefinitionRepository sceneAttributeDefinitionRepository;

    @Query
    public List<SceneAttributeDefinitionBaseDTO> getSceneAttributeDefinitions(UUID shotlistId){
        userRepository.checkShotlistViewRights(shotlistId, jwt);

        return sceneAttributeDefinitionRepository.listAllForShotlist(shotlistId);
    }

    @Mutation
    public SceneAttributeDefinitionBaseDTO createSceneAttributeDefinition(SceneAttributeDefinitionCreateDTO createDTO){
        userRepository.checkShotlistEditRights(createDTO.shotlistId(), jwt);

        return sceneAttributeDefinitionRepository.create(createDTO);
    }

    @Mutation
    public SceneAttributeDefinitionBaseDTO deleteSceneAttributeDefinition(Long id){
        userRepository.checkShotlistEditRights(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(id), jwt);

        return sceneAttributeDefinitionRepository.delete(id);
    }

    @Mutation
    public SceneAttributeDefinitionBaseDTO updateSceneAttributeDefinition(SceneAttributeDefinitionEditDTO editDTO) {
        userRepository.checkShotlistEditRights(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(editDTO.id()), jwt);

        return sceneAttributeDefinitionRepository.update(editDTO);
    }

    /*
    * ATTRIBUTES
    */

    @Inject
    SceneAttributeRepository sceneAttributeRepository;

    @Mutation
    public SceneAttributeBaseDTO updateSceneAttribute(SceneAttributeEditDTO editDTO) {
        SceneAttributeDefinitionBase sceneAttributeDefinition = sceneAttributeRepository.findById(editDTO.id()).definition;
        Shotlist affectedShotlist = sceneAttributeDefinitionRepository.getShotlistByDefinitionId(sceneAttributeDefinition.id);
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        SceneAttributeBaseDTO result = sceneAttributeRepository.update(editDTO);

        shotlistWebsocketService.broadcast(
                affectedShotlist.id,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.SCENE_ATTRIBUTE_UPDATED,
                        userRepository.findOrCreateByJWT(jwt).id,
                        new SceneAttributePayload(
                            result
                        )
                )
        );

        return result;
    }

    /*
    * SELECT OPTIONS
    */

    @Inject
    SceneSelectAttributeOptionDefinitionRepository sceneSelectAttributeOptionDefinitionRepository;

    @Query
    public List<SceneSelectAttributeOptionDefinition> getSceneSelectAttributeOptions(Long attributeDefinitionId) {
        userRepository.checkShotlistViewRights(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(attributeDefinitionId), jwt);

        return sceneSelectAttributeOptionDefinitionRepository.list("sceneAttributeDefinition.id = ?1 order by name", attributeDefinitionId);
    }

    @Query
    public List<SceneSelectAttributeOptionDefinition> searchSceneSelectAttributeOptions(SceneSelectAttributeOptionSearchDTO searchDTO){
        userRepository.checkShotlistViewRights(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(searchDTO.sceneAttributeDefinitionId()), jwt);

        return sceneSelectAttributeOptionDefinitionRepository.search(searchDTO);
    }

    @Mutation
    public SceneSelectAttributeOptionDefinition createSceneSelectAttributeOption(SceneSelectAttributeOptionCreateDTO createDTO){
        Shotlist affectedShotlist = sceneAttributeDefinitionRepository.getShotlistByDefinitionId(createDTO.attributeDefinitionId());
        userRepository.checkShotlistEditRights(affectedShotlist, jwt);

        SceneSelectAttributeOptionDefinition result = sceneSelectAttributeOptionDefinitionRepository.create(createDTO);

        shotlistWebsocketService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SCENE_SELECT_OPTION_CREATED,
                userRepository.findOrCreateByJWT(jwt).id,
                new SceneSelectOptionPayload(
                    result
                )
            )
        );

        return result;
    }

    @Mutation
    public SceneSelectAttributeOptionDefinition deleteSceneSelectAttributeOption(Long id){
        SceneAttributeDefinitionBase sceneAttributeDefinition = sceneSelectAttributeOptionDefinitionRepository.findById(id).sceneAttributeDefinition;
        userRepository.checkShotlistEditRights(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(sceneAttributeDefinition.id), jwt);

        return sceneSelectAttributeOptionDefinitionRepository.delete(id);
    }

    @Mutation
    public SceneSelectAttributeOptionDefinition updateSceneSelectAttributeOption(SceneSelectAttributeOptionEditDTO editDTO) {
        SceneAttributeDefinitionBase sceneAttributeDefinition = sceneSelectAttributeOptionDefinitionRepository.findById(editDTO.id()).sceneAttributeDefinition;
        userRepository.checkShotlistEditRights(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(sceneAttributeDefinition.id), jwt);

        return sceneSelectAttributeOptionDefinitionRepository.update(editDTO);
    }
}
