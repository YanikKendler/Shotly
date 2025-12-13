package me.kendler.yanik.repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotAllowedException;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationCreateDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationEditDTO;
import me.kendler.yanik.model.Collaboration;
import me.kendler.yanik.model.CollaborationState;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.User;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class CollaborationRepository implements PanacheRepositoryBase<Collaboration, UUID> {
    @Inject UserRepository userRepository;
    @Inject ShotlistRepository shotlistRepository;

    public List<CollaborationDTO> getPendingByJWT(JsonWebToken jwt){
        User user = userRepository.findOrCreateByJWT(jwt);

        return find(
                "user.id = ?1 and collaborationState = ?2",
                user.id,
                CollaborationState.PENDING
        ).stream()
                .map(Collaboration::toDTO)
                .toList();
    }

    public CollaborationDTO acceptOrDecline(UUID id, CollaborationState newState, JsonWebToken jwt){
        Collaboration collaboration = findById(id);

        if(collaboration == null){
            throw new IllegalArgumentException("Collaboration with ID " + id + " not found.");
        }

        if(newState != CollaborationState.ACCEPTED && newState != CollaborationState.DECLINED){
            throw new IllegalArgumentException("New state must be either ACCEPTED or DECLINED.");
        }

        if(collaboration.collaborationState != CollaborationState.PENDING){
            throw new IllegalArgumentException("Collaboration with ID " + id + " is not in PENDING state.");
        }

        User user = userRepository.findOrCreateByJWT(jwt);

        if(!collaboration.user.id.equals(user.id)){
            throw new NotAllowedException("User is not involved in this collaboration.");
        }

        collaboration.collaborationState = newState;

        return collaboration.toDTO();
    }

    // INFO: possible issue here because a user could add himself as a collaborator
    // but access checks prioritize owners so it shouldnt matter
    public CollaborationDTO create(CollaborationCreateDTO createDTO){
        User user = userRepository.find("email", createDTO.email()).firstResult();

        if(user == null){
            throw new IllegalArgumentException("User with email " + createDTO.email() + " not found.");
        }

        Shotlist shotlist = shotlistRepository.findById(createDTO.shotlistId());

        if(shotlist == null){
            throw new IllegalArgumentException("Shotlist with ID " + createDTO.shotlistId() + " not found.");
        }

        Collaboration collaboration = new Collaboration(
            user,
            shotlist
        );

        persist(collaboration);

        return collaboration.toDTO();
    }

    public CollaborationDTO update(CollaborationEditDTO editDTO){
        Collaboration collaboration = findById(editDTO.id());

        if(collaboration == null){
            throw new IllegalArgumentException("Collaboration with ID " + editDTO.id() + " not found.");
        }

        if(editDTO.collaborationType() != null){
            collaboration.collaborationType = editDTO.collaborationType();
        }

        if(editDTO.collaborationState() != null){
            collaboration.collaborationState = editDTO.collaborationState();
        }

        return collaboration.toDTO();
    }

    public CollaborationDTO delete(UUID id){
        Collaboration collaboration = findById(id);

        if(collaboration == null){
            throw new IllegalArgumentException("Collaboration with ID " + id + " not found.");
        }

        deleteById(id);

        return collaboration.toDTO();
    }
}
