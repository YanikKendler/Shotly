package me.kendler.yanik.repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.auth0.Auth0Service;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.dto.user.UserEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.*;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.model.template.sceneAttributes.SceneSingleSelectAttributeTemplate;
import me.kendler.yanik.model.template.sceneAttributes.SceneTextAttributeTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotTextAttributeTemplate;
import me.kendler.yanik.repositories.template.SceneAttributeTemplateRepository;
import me.kendler.yanik.repositories.template.ShotAttributeTemplateRepository;
import me.kendler.yanik.repositories.template.TemplateRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<User, UUID> {
    @Inject
    ShotlistRepository shotlistRepository;

    @Inject
    TemplateRepository templateRepository;

    @Inject
    ShotAttributeTemplateRepository shotAttributeTemplateRepository;

    @Inject
    SceneAttributeTemplateRepository sceneAttributeTemplateRepository;

    @Inject
    Auth0Service auth0Service;

    private static final Logger LOGGER = Logger.getLogger(UserRepository.class);

    @Transactional
    @ActivateRequestContext // gpt said to do this because of "RequestScoped context was not active" error
    public User findOrCreateByJWT(JsonWebToken jwt) {
        String auth0Sub = jwt.getClaim("sub");
        if (auth0Sub == null) {
            LOGGER.errorf("Tried to find user by JWT %s, but JWT does not contain 'sub' claim", jwt.toString());
            throw new ShotlyException("JWT does not contain 'sub' claim", ShotlyErrorCode.INVALID_INPUT);
        }

        //required because lazy loading :3
        User user = getEntityManager().createQuery("""
                        SELECT DISTINCT u FROM User u
                        LEFT JOIN FETCH u.shotlists
                        LEFT JOIN FETCH u.templates
                        WHERE u.auth0Sub = :auth0Sub
                        """, User.class)
                .setParameter("auth0Sub", auth0Sub)
                .getResultStream()
                .findFirst()
                .orElse(null);

        if (user != null) {
            if(!user.isActive){
                throw new ShotlyException("User account is deactivated", ShotlyErrorCode.ACCOUNT_DEACTIVATED);
            }else{
                return user;
            }
        } else {
            User newUser = new User(auth0Sub, jwt.getClaim("name"), jwt.getClaim("email"));
            persist(newUser);
            LOGGER.infof("Created new user: %s", newUser.toString());
            Template defaultTemplate = new Template(newUser, "Default");
            templateRepository.persist(defaultTemplate);

            ShotTextAttributeTemplate motive = new ShotTextAttributeTemplate(defaultTemplate);
            motive.name = "Motive";
            shotAttributeTemplateRepository.persist(motive);

            SceneSingleSelectAttributeTemplate location = new SceneSingleSelectAttributeTemplate(defaultTemplate);
            location.name = "Location";
            sceneAttributeTemplateRepository.persist(location);

            return newUser;
        }
    }

    @Transactional
    public UserDTO getCurrentUserDTO(JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        if(user.tier != UserTier.BASIC && user.revokeProAfter != null && user.revokeProAfter.isBefore(LocalDate.now())){
            LOGGER.infof("Revoking %s from user %s due to subscription expiration", user.tier.name(), user.toString());
            user.tier = UserTier.BASIC;
            persist(user);
        }
        return user.toDTO();
    }

    @Transactional
    public User update(UserEditDTO editDTO, JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        if (editDTO.name() != null) {
            user.name = editDTO.name();
        }
        persist(user);
        LOGGER.infof("Updated user: %s", user.toString());
        return user;
    }

    @Transactional
    public User delete(JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        LOGGER.infof("Deleting user: %s", user.toString());
        auth0Service.deleteUser(user.auth0Sub);
        for (Shotlist shotlist : user.shotlists) {
            shotlistRepository.delete(shotlist.id);
        }
        for (Template template : user.templates) {
            templateRepository.delete(template.id);
        }
        delete(user);
        return user;
    }

    public String triggerPasswordReset(JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return auth0Service.triggerPasswordReset(user.email);
    }

    @Transactional
    public boolean shotlistIsEditable(Shotlist shotlist) {
        //refetch owner to prevent lazy loading issues
        User owner;
        try{
            owner = findById(shotlist.owner.id);
        }catch (Exception e) {
            return false;
        }

        if(owner.tier == UserTier.BASIC && owner.shotlists.size() > 1){
            return false;
        }
        return true;
    }

    // SHOTLIST
    // editor

    @Transactional
    public boolean userCanEditShotlist(Shotlist shotlist, User user) {
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

    public boolean userCanEditShotlist(Shotlist shotlist, JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return userCanEditShotlist(shotlist, user);
    }

    public void checkShotlistEditRights(Shotlist shotlist, JsonWebToken jwt) {
        if(!shotlistIsEditable(shotlist)) {
            throw new ShotlyException("This shotlist is read only", ShotlyErrorCode.SHOTLIST_LIMIT_REACHED);
        }
        if (!userCanEditShotlist(shotlist, jwt)) {
            throw new ShotlyException("You are not allowed to access this shotlist", ShotlyErrorCode.WRITE_NOT_ALLOWED);
        }
    }

    public void checkShotlistEditRights(UUID shotlistId, JsonWebToken jwt) {
        checkShotlistEditRights(shotlistRepository.findByIdValidated(shotlistId), jwt);
    }

    public void checkTemplateEditRights(UUID templateId, JsonWebToken jwt) {
        checkTemplateEditRights(templateRepository.findById(templateId), jwt);
    }

    // viewer

    @Transactional
    public boolean userCanViewShotlist(Shotlist shotlist, User user) {
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

    public boolean userCanViewShotlist(Shotlist shotlist, JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return userCanViewShotlist(shotlist, user);
    }

    public void checkShotlistViewRights(Shotlist shotlist, JsonWebToken jwt) {
        if (!userCanViewShotlist(shotlist, jwt)) {
            throw new ShotlyException("You are not allowed to access this shotlist", ShotlyErrorCode.READ_NOT_ALLOWED);
        }
    }

    public void checkShotlistViewRights(UUID shotlistId, JsonWebToken jwt) {
        checkShotlistViewRights(shotlistRepository.findByIdValidated(shotlistId), jwt);
    }

    // owner

    @Transactional
    public boolean userIsShotlistOwner(Shotlist shotlist, User user) {
        if (shotlist == null){
            return false;
        }

        return user.equals(shotlist.owner);
    }

    public boolean userIsShotlistOwner(Shotlist shotlist, JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return userIsShotlistOwner(shotlist, user);
    }

    public void checkShotlistOwner(Shotlist shotlist, JsonWebToken jwt) {
        if (!userIsShotlistOwner(shotlist, jwt)) {
            throw new ShotlyException("You are not allowed to access this shotlist", ShotlyErrorCode.WRITE_NOT_ALLOWED);
        }
    }

    public void checkShotlistOwner(UUID shotlistId, JsonWebToken jwt) {
        checkShotlistOwner(shotlistRepository.findByIdValidated(shotlistId), jwt);
    }

    // TEMPLATE

    public boolean userCanEditTemplate(Template template, User user) {
        // TODO Add collaborator support
        if (template != null && user.equals(template.owner)) {
            return true;
        }
        return false;
    }

    public boolean userCanEditTemplate(Template template, JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return userCanEditTemplate(template, user);
    }

    public void checkTemplateEditRights(Template template, JsonWebToken jwt) {
        if (!userCanEditTemplate(template, jwt)) {
            throw new ShotlyException("You are not allowed to access this template", ShotlyErrorCode.WRITE_NOT_ALLOWED);
        }
    }
}
