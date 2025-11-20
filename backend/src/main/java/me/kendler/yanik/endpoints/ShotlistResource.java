package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import me.kendler.yanik.Util;
import me.kendler.yanik.dto.shotlist.ShotlistCreateDTO;
import me.kendler.yanik.dto.shotlist.ShotlistDTO;
import me.kendler.yanik.dto.shotlist.ShotlistEditDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.repositories.ShotlistRepository;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;
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
        long start = System.nanoTime();
        List<ShotlistDTO> result = shotlistRepository.findAllForUser(jwt);
        Util.timer(start, "getShotlists");
        return result;
    }

    @Query
    public ShotlistDTO getShotlist(UUID id) {
        userRepository.checkShotlistReadAccessRights(shotlistRepository.findById(id), jwt);

        return shotlistRepository.findAsDTO(id);
    }

    @Mutation
    public ShotlistDTO createShotlist(ShotlistCreateDTO createDTO) {
        return shotlistRepository.create(createDTO, jwt);
    }

    @Mutation
    public ShotlistDTO updateShotlist(ShotlistEditDTO editDTO) {
        userRepository.checkShotlistAccessRights(shotlistRepository.findById(editDTO.id()), jwt);
        return shotlistRepository.update(editDTO);
    }

    @Mutation
    public ShotlistDTO deleteShotlist(UUID id) {
        userRepository.checkShotlistAccessRights(shotlistRepository.findById(id), jwt);
        return shotlistRepository.delete(id);
    }
}
