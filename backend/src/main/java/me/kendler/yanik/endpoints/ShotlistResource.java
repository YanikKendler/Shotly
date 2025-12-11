package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationCreateDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;
import me.kendler.yanik.dto.shotlist.ShotlistCreateDTO;
import me.kendler.yanik.dto.shotlist.ShotlistDTO;
import me.kendler.yanik.dto.shotlist.ShotlistEditDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationEditDTO;
import me.kendler.yanik.repositories.CollaborationRepository;
import me.kendler.yanik.repositories.ShotlistRepository;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;

@GraphQLApi
public class ShotlistResource {
    private static final Logger log = LoggerFactory.getLogger(ShotlistResource.class);
    @Inject
    JsonWebToken jwt;

    @Inject
    ShotlistRepository shotlistRepository;

    @Inject
    UserRepository userRepository;

    @Query
    public List<ShotlistDTO> getShotlists() {
        return shotlistRepository.findAllForUser(jwt);
    }

    @Query
    public ShotlistDTO getShotlist(UUID id) {
        userRepository.checkShotlistViewRights(shotlistRepository.findById(id), jwt);

        return shotlistRepository.findAsDTO(id);
    }

    @Mutation
    public ShotlistDTO createShotlist(ShotlistCreateDTO createDTO) {
        return shotlistRepository.create(createDTO, jwt);
    }

    @Mutation
    public ShotlistDTO updateShotlist(ShotlistEditDTO editDTO) {
        userRepository.checkShotlistEditRights(shotlistRepository.findById(editDTO.id()), jwt);
        return shotlistRepository.update(editDTO);
    }

    @Mutation
    public ShotlistDTO deleteShotlist(UUID id) {
        userRepository.checkShotlistEditRights(shotlistRepository.findById(id), jwt);
        return shotlistRepository.delete(id);
    }

    /*
    * COLLABORATIONS
    */

    @Inject
    CollaborationRepository collaborationRepository;

    @Mutation
    public CollaborationDTO addCollaboration(CollaborationCreateDTO createDTO){
        userRepository.checkShotlistEditRights(shotlistRepository.findById(createDTO.shotlistId()), jwt);

        return collaborationRepository.create(createDTO);
    }

    @Mutation
    public CollaborationDTO editCollaboration(CollaborationEditDTO editDTO) {
        userRepository.checkShotlistEditRights(collaborationRepository.findById(editDTO.id()).shotlist, jwt);

        return collaborationRepository.update(editDTO);
    }

    @Mutation
    public CollaborationDTO deleteCollaboration(UUID id){
        userRepository.checkShotlistEditRights(collaborationRepository.findById(id).shotlist, jwt);

        return collaborationRepository.delete(id);
    }
}
