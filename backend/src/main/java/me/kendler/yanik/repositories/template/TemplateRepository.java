package me.kendler.yanik.repositories.template;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.template.TemplateCreateDTO;
import me.kendler.yanik.dto.template.TemplateDTO;
import me.kendler.yanik.dto.template.TemplateEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.User;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.model.template.sceneAttributes.SceneAttributeTemplateBase;
import me.kendler.yanik.model.template.shotAttributes.ShotAttributeTemplateBase;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class TemplateRepository implements PanacheRepositoryBase<Template, UUID> {
    @Inject
    UserRepository userRepository;

    private final Logger LOGGER = Logger.getLogger(TemplateRepository.class);

    public TemplateDTO findAsDTO(UUID id) {
        Template template = findById(id);
        if (template == null) {
            return null;
        }
        return template.toDTO();
    }

    public List<TemplateDTO> findAllForUser(JsonWebToken jwt) {
        return userRepository
                .findOrCreateByJWT(jwt)
                .templates
                .stream()
                .map(Template::toDTO)
                .toList();
    }

    public TemplateDTO create(TemplateCreateDTO createDTO, JsonWebToken jwt) {
        User user = userRepository.findOrCreateByJWT(jwt);
        Template template = new Template(userRepository.findOrCreateByJWT(jwt), createDTO.name());
        persist(template);
        LOGGER.infof("Created new template: %s for user %s", template.name, user.email);
        return template.toDTO();
    }

    public TemplateDTO update(TemplateEditDTO editDTO){
        Template template = findById(editDTO.id());
        template.name = editDTO.name();
        return template.toDTO();
    }

    public TemplateDTO delete(UUID id) {
        Template template = findById(id);

        if(template == null) {
            throw new ShotlyException("Template not found", ShotlyErrorCode.NOT_FOUND);
        }

        List<Shotlist> relevantShotlists = Shotlist.find("template.id", template.id).list();
        for (Shotlist shotlist : relevantShotlists) {
            shotlist.template = null;
        }

        delete(template);
        return template.toDTO();
    }
}
