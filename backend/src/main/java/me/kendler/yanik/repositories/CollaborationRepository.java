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

import java.util.LinkedList;
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
                "user.id = ?1 and collaborationState = ?2 order by user.name asc, user.id asc",
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

    /**
     * Creates a new Collaboration with all users found with the given email
     * Its possible to have multiple users with the same email because Auth0 does not provide a clean way of
     * preventing signup via a social login if the email is already used in a email/password login.
     * <a href="https://community.auth0.com/t/block-social-sign-up-if-user-with-email-already-exists/65639/5">relevant post</a>
     *
     * That means that the same user could have multiple accounts with the same email,
     * the easiest way of handling this is to create collaborations for all users with the given email.
     */
    public List<CollaborationDTO> create(CollaborationCreateDTO createDTO, JsonWebToken jwt){
        User currentUser = userRepository.findOrCreateByJWT(jwt);

        if(createDTO.email().equals(currentUser.email)){
            throw new IllegalArgumentException("Cannot create collaboration with yourself.");
        }

        Shotlist shotlist = shotlistRepository.findById(createDTO.shotlistId());

        if(shotlist == null){
            throw new IllegalArgumentException("Shotlist with ID " + createDTO.shotlistId() + " not found.");
        }

        List<UUID> existingCollaboratorIds = shotlist.collaborations.stream().map(c -> c.user.id).toList();

        List<User> users = userRepository.find(
                "email = ?1 and id not in ?2",
                createDTO.email(),
                existingCollaboratorIds
        ).list();

        if(users == null || users.isEmpty()){
            throw new IllegalArgumentException("User with email " + createDTO.email() + " not found.");

        }


        List<CollaborationDTO> result = new LinkedList<>();

        for (User user : users) {
            Collaboration collaboration = new Collaboration(
                user,
                shotlist
            );
            persist(collaboration);
            result.add(collaboration.toDTO());
        }

        return result;
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

    public CollaborationDTO refresh(UUID id){
        Collaboration collaboration = findById(id);

        if(collaboration == null){
            throw new IllegalArgumentException("Collaboration with ID " + id + " not found.");
        }

        collaboration.collaborationState = CollaborationState.PENDING;
        persist(collaboration);

        return collaboration.toDTO();
    }
}
