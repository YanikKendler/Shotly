package me.kendler.yanik.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.User;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.repositories.template.TemplateRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.UUID;

@ApplicationScoped
public class TemplateAccessService {
    @Inject
    UserRepository userRepository;

    @Inject
    TemplateRepository templateRepository;

    public boolean canEdit(Template template, User user) {
        if (template != null && user.equals(template.owner)) {
            return true;
        }
        return false;
    }

    public void checkEdit(Template template, User user) {
        if (!canEdit(template, user)) {
            throw new ShotlyException("You are not allowed to access this template", ShotlyErrorCode.WRITE_NOT_ALLOWED);
        }
    }

    public void checkEdit(Template template, JsonWebToken jwt) {
        checkEdit(
            template,
            userRepository.findOrCreateByJWT(jwt)
        );
    }

    public void checkEdit(UUID templateId, JsonWebToken jwt) {
        checkEdit(
            templateRepository.findById(templateId),
            userRepository.findOrCreateByJWT(jwt)
        );
    }

    public void checkEdit(UUID templateId, User user) {
        checkEdit(
            templateRepository.findById(templateId),
            user
        );
    }
}
