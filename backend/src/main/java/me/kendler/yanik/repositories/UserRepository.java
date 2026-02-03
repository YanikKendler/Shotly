package me.kendler.yanik.repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.json.JsonArray;
import jakarta.json.JsonString;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import me.kendler.yanik.auth0.Auth0Service;
import me.kendler.yanik.dto.user.UserAdminUpdateDTO;
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
import me.kendler.yanik.stripe.StripeService;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<User, UUID> {
    @Inject
    ShotlistRepository shotlistRepository;

    @Inject
    TemplateRepository templateRepository;

    @Inject
    CollaborationRepository collaborationRepository;

    @Inject
    ShotAttributeTemplateRepository shotAttributeTemplateRepository;

    @Inject
    SceneAttributeTemplateRepository sceneAttributeTemplateRepository;

    @Inject
    Auth0Service auth0Service;

    @Inject
    StripeService stripeService;

    private static final Logger LOGGER = Logger.getLogger(UserRepository.class);

    @Transactional
    @ActivateRequestContext // gpt said to do this because of "RequestScoped context was not active" error
    public User findOrCreateByJWT(JsonWebToken jwt) {
        String auth0Sub = jwt.getClaim("sub");

        User user = findByAuth0SubWithFetch(auth0Sub);

        if (user != null) {
            updateLastActiveById(user.id);

            if (!user.isActive) {
                throw new ShotlyException("User account is deactivated",
                        ShotlyErrorCode.ACCOUNT_DEACTIVATED);
            }
            return user;
        }

        User newUser = new User(
                auth0Sub,
                jwt.getClaim("name"),
                jwt.getClaim("email")
        );

        try {
            createUser(newUser);

            LOGGER.infof("Created new user: %s", newUser);

            Template defaultTemplate = new Template(newUser, "Default");
            templateRepository.persist(defaultTemplate);

            ShotTextAttributeTemplate motive = new ShotTextAttributeTemplate(defaultTemplate);
            motive.name = "Motive";
            shotAttributeTemplateRepository.persist(motive);

            SceneSingleSelectAttributeTemplate location = new SceneSingleSelectAttributeTemplate(defaultTemplate);
            location.name = "Location";
            sceneAttributeTemplateRepository.persist(location);

            return newUser;

        } catch (PersistenceException e) {
            LOGGER.info("Duplicate user detected, refetching");
            return findByAuth0SubWithFetch(auth0Sub);
        }
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void updateLastActiveById(UUID userId) {
        getEntityManager()
                .createQuery("UPDATE User u SET u.lastActiveAt = :now WHERE u.id = :id")
                .setParameter("now", ZonedDateTime.now())
                .setParameter("id", userId)
                .executeUpdate();
    }

    public User findByAuth0SubWithFetch(String auth0Sub) {
        return getEntityManager().createQuery("""
            SELECT DISTINCT u FROM User u
            LEFT JOIN FETCH u.shotlists
            LEFT JOIN FETCH u.templates
            WHERE u.auth0Sub = :auth0Sub
            """, User.class)
                .setParameter("auth0Sub", auth0Sub)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public User createUser(User user) {
        persist(user);
        flush();
        return user;
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

        List<Collaboration> relevantCollaborations = collaborationRepository.find("user.id = ?1", user.id).list();

        for (Shotlist shotlist : user.shotlists) {
            shotlistRepository.delete(shotlist.id);
        }
        for (Template template : user.templates) {
            templateRepository.delete(template.id);
        }
        for (Collaboration collaboration : relevantCollaborations) {
            collaborationRepository.delete(collaboration.id);
        }

        getEntityManager().createNativeQuery("DELETE FROM app_user WHERE id = ?1")
                .setParameter(1, user.id)
                .executeUpdate();

        stripeService.cancelAllSubscriptions(user);

        auth0Service.deleteUser(user.auth0Sub);

        return user;
    }

    public String triggerPasswordReset(JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return auth0Service.triggerPasswordReset(user.email);
    }

    @Transactional
    public User setHowDidYourHearReason(JsonWebToken jwt, String reason) {
        User user = findOrCreateByJWT(jwt);

        user.howDidYouHearReason = reason;

        return user;
    }

    /*@Transactional
    public User setAllowAnalytics(JsonWebToken jwt, boolean allow) {
        User user = findOrCreateByJWT(jwt);

        user.allowAnalytics = allow;

        return user;
    }*/

    @Transactional
    public UserDTO adminUserUpdate(UserAdminUpdateDTO updateDTO) {
        User user = findById(updateDTO.id());

        System.out.println(updateDTO.toString());

        if(user == null)
            throw new ShotlyException("User not found", ShotlyErrorCode.NOT_FOUND);

        if(updateDTO.isActive() != null)
            user.isActive = updateDTO.isActive();

        if(updateDTO.tier() != null)
            user.tier = updateDTO.tier();
        
        user.revokeProAfter = updateDTO.revokeProAfter();

        persist(user);

        return user.toDTO();
    }

    // ADMIN

    public boolean isAdmin(JsonWebToken jwt) {
        Object rolesClaim = jwt.getClaim("https://shotly.at/roles");

        if (rolesClaim instanceof JsonArray jsonArray) {
            return jsonArray.getValuesAs(JsonString.class)
                    .stream()
                    .anyMatch(js -> js.getString().equalsIgnoreCase("Admin"));
        }

        return false;
    }

    public void checkAdmin(JsonWebToken jwt) {
        if (!isAdmin(jwt)) {
            throw new ShotlyException("You are not allowed to access this resource", ShotlyErrorCode.NOT_ALLOWED);
        }
    }

    // SHOTLIST

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
