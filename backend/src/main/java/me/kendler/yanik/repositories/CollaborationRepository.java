package me.kendler.yanik.repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationCreateDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationDTO;
import me.kendler.yanik.dto.shotlist.collaboration.CollaborationEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.*;
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
            throw new ShotlyException("Collaboration with ID " + id + " not found.", ShotlyErrorCode.NOT_FOUND);
        }

        if(newState != CollaborationState.ACCEPTED && newState != CollaborationState.DECLINED){
            throw new ShotlyException("New state must be either ACCEPTED or DECLINED.", ShotlyErrorCode.INVALID_INPUT);
        }

        if(collaboration.collaborationState != CollaborationState.PENDING){
            throw new ShotlyException("Collaboration with ID " + id + " is not in PENDING state.", ShotlyErrorCode.NOT_ALLOWED);
        }

        User user = userRepository.findOrCreateByJWT(jwt);

        if(!collaboration.user.id.equals(user.id)){
            throw new ShotlyException("User is not involved in this collaboration.", ShotlyErrorCode.NOT_ALLOWED);
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
            throw new ShotlyException("Cannot create collaboration with yourself.", ShotlyErrorCode.NOT_ALLOWED);
        }

        Shotlist shotlist = shotlistRepository.findByIdValidated(createDTO.shotlistId());

        if(shotlist == null){
            throw new ShotlyException("Shotlist with ID " + createDTO.shotlistId() + " not found.", ShotlyErrorCode.NOT_FOUND);
        }

        if(currentUser.tier == UserTier.BASIC && shotlist.collaborations.size() >= 5){
            throw new ShotlyException("Basic users can only have one shotlist", ShotlyErrorCode.COLLABORATOR_LIMIT_REACHED);
        }

        List<UUID> existingCollaboratorIds = shotlist.collaborations.stream().map(c -> c.user.id).toList();

        List<User> users = userRepository.find(
                "email = ?1 and id not in ?2",
                createDTO.email(),
                existingCollaboratorIds
        ).list();

        if(users == null || users.isEmpty()){
            throw new ShotlyException("User with email " + createDTO.email() + " not found.", ShotlyErrorCode.NOT_FOUND);

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
            throw new ShotlyException("Collaboration with ID " + editDTO.id() + " not found.", ShotlyErrorCode.NOT_FOUND);
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
            throw new ShotlyException("Collaboration with ID " + id + " not found.", ShotlyErrorCode.NOT_FOUND);
        }

        deleteById(id);

        return collaboration.toDTO();
    }

    public CollaborationDTO refresh(UUID id){
        Collaboration collaboration = findById(id);

        if(collaboration == null){
            throw new ShotlyException("Collaboration with ID " + id + " not found.", ShotlyErrorCode.NOT_FOUND);
        }

        collaboration.collaborationState = CollaborationState.PENDING;
        persist(collaboration);

        return collaboration.toDTO();
    }
}
