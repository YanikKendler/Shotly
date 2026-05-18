package me.kendler.yanik.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.*;
import me.kendler.yanik.repositories.ShotlistRepository;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.UUID;

@ApplicationScoped
public class ShotlistAccessService {
    @Inject
    UserRepository userRepository;

    @Inject
    ShotlistRepository shotlistRepository;

    /**
     * Checks if the shotlists owner has reached the maximum allowed shotlists which would make it readOnly
     * @param shotlist to be checked
     * @return true or false
     */
    private boolean shotlistIsEditable(Shotlist shotlist) {
        //refetch owner to prevent lazy loading issues
        User owner;
        try{
            owner = userRepository.findById(shotlist.owner.id);
        }catch (Exception e) {
            return false;
        }

        if(owner.tier == UserTier.BASIC && owner.shotlists.size() > 1){
            return false;
        }

        return true;
    }

    // editor

    private boolean canEdit(Shotlist shotlist, User user) {
        if (shotlist == null){
            return false;
        }
        //required because lazy loading :3
        Shotlist managed = shotlistRepository.findByIdValidated(shotlist.id);
        if (managed == null) {
            return false;
        }

        if (
            user.equals(managed.owner) ||
            managed.collaborations
                .stream()
                .anyMatch(c ->
                    c.user.id.equals(user.id) &&
                    c.collaborationState.equals(CollaborationState.ACCEPTED) &&
                    c.collaborationType.equals(CollaborationType.EDIT)
                )
        ) {
            return true;
        }

        return false;
    }

    public void checkEdit(Shotlist shotlist, User user) {
        if(shotlist.isArchived) {
            throw new ShotlyException("This shotlist is archived and cannot be edited", ShotlyErrorCode.WRITE_NOT_ALLOWED);
        }
        if(!shotlistIsEditable(shotlist)) {
            throw new ShotlyException("This shotlist is read only", ShotlyErrorCode.SHOTLIST_LIMIT_REACHED);
        }
        if (!canEdit(shotlist, user)) {
            throw new ShotlyException("You are not allowed to access this shotlist", ShotlyErrorCode.WRITE_NOT_ALLOWED);
        }
    }

    public void checkEdit(Shotlist shotlist, JsonWebToken jwt) {
        checkEdit(
            shotlist,
            userRepository.findOrCreateByJWT(jwt)
        );
    }

    public void checkEdit(UUID shotlistId, JsonWebToken jwt) {
        checkEdit(
            shotlistRepository.findByIdValidated(shotlistId),
            userRepository.findOrCreateByJWT(jwt)
        );
    }

    public void checkEdit(UUID shotlistId, User user) {
        checkEdit(
            shotlistRepository.findByIdValidated(shotlistId),
            user
        );
    }

    // viewer

    private boolean canView(Shotlist shotlist, User user) {
        if (shotlist == null){
            return false;
        }
        //required because lazy loading :3
        Shotlist managed = shotlistRepository.findByIdValidated(shotlist.id);
        if (managed == null) {
            return false;
        }

        if (
            user.equals(managed.owner) ||
            managed.collaborations
                .stream()
                .anyMatch(c ->
                    c.user.id.equals(user.id) &&
                    c.collaborationState.equals(CollaborationState.ACCEPTED)
                )
        ) {
            return true;
        }

        return false;
    }

    public void checkView(Shotlist shotlist, User user) {
        if (!canView(shotlist, user)) {
            throw new ShotlyException("You are not allowed to access this shotlist", ShotlyErrorCode.READ_NOT_ALLOWED);
        }
    }

    public void checkView(Shotlist shotlist, JsonWebToken jwt) {
        checkView(
            shotlist,
            userRepository.findOrCreateByJWT(jwt)
        );
    }

    public void checkView(UUID shotlistId, JsonWebToken jwt) {
        checkView(
            shotlistRepository.findByIdValidated(shotlistId),
            userRepository.findOrCreateByJWT(jwt)
        );
    }

    public void checkView(UUID shotlistId, User user) {
        checkView(
            shotlistRepository.findByIdValidated(shotlistId),
            user
        );
    }

    // owner

    private boolean isOwner(Shotlist shotlist, User user) {
        if (shotlist == null){
            return false;
        }

        return user.equals(shotlist.owner);
    }

    public void checkOwner(Shotlist shotlist, User user) {
        if (!isOwner(shotlist, user)) {
            throw new ShotlyException("You are not allowed to access this shotlist", ShotlyErrorCode.WRITE_NOT_ALLOWED);
        }
    }

    public void checkOwner(Shotlist shotlist, JsonWebToken jwt) {
        checkOwner(
            shotlist,
            userRepository.findOrCreateByJWT(jwt)
        );
    }

    public void checkOwner(UUID shotlistId, JsonWebToken jwt) {
        checkOwner(
            shotlistRepository.findByIdValidated(shotlistId),
            userRepository.findOrCreateByJWT(jwt)
        );
    }

    public void checkOwner(UUID shotlistId, User user) {
        checkOwner(
            shotlistRepository.findByIdValidated(shotlistId),
            user
        );
    }
}
