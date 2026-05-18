package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import me.kendler.yanik.auth.ShotlistAccessService;
import me.kendler.yanik.dto.scene.*;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.scene.attributes.SceneAttributeBaseDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.User;
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
import me.kendler.yanik.socket.ShotlistSyncService;
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
    ShotlistSyncService syncService;

    @Inject
    ShotlistAccessService accessService;

    @Query
    public List<SceneDTO> getScenes(UUID shotlistId) {
        accessService.checkView(shotlistId, jwt);

        return sceneRepository.listAllForShotlist(shotlistId);
    }

    @Mutation
    public SceneDTO createScene(UUID shotlistId) {
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkEdit(shotlistId, user);

        SceneDTO result = sceneRepository.create(shotlistId);

        syncService.broadcast(
            shotlistId,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SCENE_ADDED,
                user.id,
                new ScenePayload(
                    result
                )
            )
        );

        return result;
    }

    @Mutation
    public SceneDTO deleteScene(UUID id) {
        Shotlist affectedShotlist = sceneRepository.findByIdValidated(id).shotlist;
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkEdit(affectedShotlist, user);

        SceneDTO result = sceneRepository.delete(id);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SCENE_DELETED,
                user.id,
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
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkEdit(affectedShotlist, user);

        SceneDTO result = sceneRepository.update(editDTO);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SCENE_UPDATED,
                user.id,
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
        accessService.checkView(shotlistId, jwt);

        return sceneAttributeDefinitionRepository.listAllForShotlist(shotlistId);
    }

    @Mutation
    public SceneAttributeDefinitionBaseDTO createSceneAttributeDefinition(SceneAttributeDefinitionCreateDTO createDTO){
        accessService.checkEdit(createDTO.shotlistId(), jwt);

        return sceneAttributeDefinitionRepository.create(createDTO);
    }

    @Mutation
    public SceneAttributeDefinitionBaseDTO deleteSceneAttributeDefinition(Long id){
        accessService.checkEdit(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(id), jwt);

        return sceneAttributeDefinitionRepository.delete(id);
    }

    @Mutation
    public SceneAttributeDefinitionBaseDTO updateSceneAttributeDefinition(SceneAttributeDefinitionEditDTO editDTO) {
        accessService.checkEdit(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(editDTO.id()), jwt);

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
        User user = userRepository.findOrCreateByJWT(jwt);

        accessService.checkEdit(affectedShotlist, user);

        SceneAttributeBaseDTO result = sceneAttributeRepository.update(editDTO);

        syncService.broadcast(
            affectedShotlist.id,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SCENE_ATTRIBUTE_UPDATED,
                user.id,
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
        accessService.checkView(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(attributeDefinitionId), jwt);

        return sceneSelectAttributeOptionDefinitionRepository.list("sceneAttributeDefinition.id = ?1 order by name", attributeDefinitionId);
    }

    @Query
    public List<SceneSelectAttributeOptionDefinition> searchSceneSelectAttributeOptions(SceneSelectAttributeOptionSearchDTO searchDTO){
        accessService.checkView(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(searchDTO.sceneAttributeDefinitionId()), jwt);

        return sceneSelectAttributeOptionDefinitionRepository.search(searchDTO);
    }

    @Mutation
    public SceneSelectAttributeOptionDefinition createSceneSelectAttributeOption(SceneSelectAttributeOptionCreateDTO createDTO){
        Shotlist affectedShotlist = sceneAttributeDefinitionRepository.getShotlistByDefinitionId(createDTO.attributeDefinitionId());
        accessService.checkEdit(affectedShotlist, jwt);

        SceneSelectAttributeOptionDefinition result = sceneSelectAttributeOptionDefinitionRepository.create(createDTO);

        syncService.broadcast(
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
        accessService.checkEdit(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(sceneAttributeDefinition.id), jwt);

        return sceneSelectAttributeOptionDefinitionRepository.delete(id);
    }

    @Mutation
    public SceneSelectAttributeOptionDefinition updateSceneSelectAttributeOption(SceneSelectAttributeOptionEditDTO editDTO) {
        SceneAttributeDefinitionBase sceneAttributeDefinition = sceneSelectAttributeOptionDefinitionRepository.findById(editDTO.id()).sceneAttributeDefinition;
        accessService.checkEdit(sceneAttributeDefinitionRepository.getShotlistByDefinitionId(sceneAttributeDefinition.id), jwt);

        return sceneSelectAttributeOptionDefinitionRepository.update(editDTO);
    }
}
