package me.kendler.yanik.repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.shotlist.ShotlistDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationCreateDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationEditDTO;
import me.kendler.yanik.model.Collaboration;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.User;

import java.util.UUID;

@ApplicationScoped
@Transactional
public class CollaborationRepository implements PanacheRepositoryBase<Collaboration, UUID> {
    @Inject UserRepository userRepository;
    @Inject ShotlistRepository shotlistRepository;

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

        if(editDTO.collaboratorRole() != null){
            collaboration.collaboratorRole = editDTO.collaboratorRole();
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
