package me.kendler.yanik.repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.UnauthorizedAccessException;
import me.kendler.yanik.Util;
import me.kendler.yanik.auth0.Auth0Service;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.dto.user.UserEditDTO;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.User;
import me.kendler.yanik.model.UserTier;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.model.template.sceneAttributes.SceneTextAttributeTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotTextAttributeTemplate;
import me.kendler.yanik.repositories.template.SceneAttributeTemplateRepository;
import me.kendler.yanik.repositories.template.ShotAttributeTemplateRepository;
import me.kendler.yanik.repositories.template.TemplateRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

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
        long start = System.nanoTime();

        String auth0Sub = jwt.getClaim("sub");
        if (auth0Sub == null) {
            LOGGER.errorf("Tried to find user by JWT %s, but JWT does not contain 'sub' claim", jwt.toString());
            throw new IllegalArgumentException("JWT does not contain 'sub' claim");
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

        Util.timer(start, "findOrCreateByJWT");

        if (user != null) {
            return user;
        } else {
            User newUser = new User(auth0Sub, jwt.getClaim("name"), jwt.getClaim("email"));
            persist(newUser);
            LOGGER.infof("Created new user: %s", newUser.toString());
            Template defaultTemplate = new Template(newUser, "Default");
            templateRepository.persist(defaultTemplate);

            ShotTextAttributeTemplate motive = new ShotTextAttributeTemplate(defaultTemplate);
            motive.name = "Motive";
            shotAttributeTemplateRepository.persist(motive);

            SceneTextAttributeTemplate location = new SceneTextAttributeTemplate(defaultTemplate);
            location.name = "Location";
            sceneAttributeTemplateRepository.persist(location);

            return newUser;
        }
    }

    public UserDTO getCurrentUserDTO(JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return user.toDto();
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

    public boolean userCanAccessShotlist(Shotlist shotlist, JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return userCanAccessShotlist(shotlist, user);
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

    public boolean userCanAccessShotlist(Shotlist shotlist, User user) {
        // TODO Add collaborator support
        if (shotlist != null && user.equals(shotlist.owner)) {
            return true;
        }
        return false;
    }

    public void checkShotlistAccessRights(Shotlist shotlist, JsonWebToken jwt) {
        if(!shotlistIsEditable(shotlist)) {
            throw new UnauthorizedAccessException("This shotlist is read only");
        }
        if (!userCanAccessShotlist(shotlist, jwt)) {
            throw new UnauthorizedAccessException("You are not allowed to access this shotlist");
        }
    }

    public void checkShotlistAccessRights(UUID shotlistId, JsonWebToken jwt) {
        checkShotlistAccessRights(shotlistRepository.findById(shotlistId), jwt);
    }

    public void checkShotlistReadAccessRights(Shotlist shotlist, JsonWebToken jwt) {
        if (!userCanAccessShotlist(shotlist, jwt)) {
            throw new UnauthorizedAccessException("You are not allowed to access this shotlist");
        }
    }

    public void checkShotlistReadAccessRights(UUID shotlistId, JsonWebToken jwt) {
        checkShotlistReadAccessRights(shotlistRepository.findById(shotlistId), jwt);
    }

    public boolean userCanAccessTemplate(Template template, JsonWebToken jwt) {
        User user = findOrCreateByJWT(jwt);
        return userCanAccessTemplate(template, user);
    }

    public boolean userCanAccessTemplate(Template template, User user) {
        // TODO Add collaborator support
        if (template != null && user.equals(template.owner)) {
            return true;
        }
        return false;
    }

    public void checkTemplateAccessRights(Template template, JsonWebToken jwt) {
        if (!userCanAccessTemplate(template, jwt)) {
            throw new UnauthorizedAccessException("You are not allowed to access this template");
        }
    }

    public void checkTemplateAccessRights(UUID templateId, JsonWebToken jwt) {
        checkTemplateAccessRights(templateRepository.findById(templateId), jwt);
    }
}
