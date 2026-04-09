package me.kendler.yanik.repositories.template;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.scene.SceneSelectAttributeOptionEditDTO;
import me.kendler.yanik.dto.template.shotAttributes.SceneSelectAttributeOptionTemplateEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.template.sceneAttributes.SceneAttributeTemplateBase;
import me.kendler.yanik.model.template.sceneAttributes.SceneMultiSelectAttributeTemplate;
import me.kendler.yanik.model.template.sceneAttributes.SceneSelectAttributeOptionTemplate;
import me.kendler.yanik.model.template.sceneAttributes.SceneSingleSelectAttributeTemplate;
import org.jboss.logging.Logger;

@ApplicationScoped
@Transactional
public class SceneSelectAttributeOptionTemplateRepository implements PanacheRepository<SceneSelectAttributeOptionTemplate> {
    @Inject
    SceneAttributeTemplateRepository sceneAttributeTemplateRepository;

    private static final Logger LOGGER = Logger.getLogger(SceneSelectAttributeOptionTemplateRepository.class);

    public SceneSelectAttributeOptionTemplate create(Long attributeTemplateId) {
        SceneAttributeTemplateBase sceneAttributeTemplate = sceneAttributeTemplateRepository.findById(attributeTemplateId);

        SceneSelectAttributeOptionTemplate sceneSelectAttributeOptionTemplate = new SceneSelectAttributeOptionTemplate(sceneAttributeTemplate);

        persist(sceneSelectAttributeOptionTemplate);

        sceneAttributeTemplate.template.registerEdit();

        return sceneSelectAttributeOptionTemplate;
    }

    public SceneSelectAttributeOptionTemplate update(SceneSelectAttributeOptionTemplateEditDTO editDTO) {
        SceneSelectAttributeOptionTemplate option = findById(editDTO.id());
        if (option == null) {
            throw new ShotlyException("SceneSelectAttributeOptionTemplate not found", ShotlyErrorCode.NOT_FOUND);
        }
        option.name = editDTO.name();

        option.sceneAttributeTemplate.template.registerEdit();

        return option;
    }

    public SceneSelectAttributeOptionTemplate delete(Long id){
        SceneSelectAttributeOptionTemplate sceneSelectAttributeOptionTemplate = findById(id);

        if(sceneSelectAttributeOptionTemplate == null) {
            throw new ShotlyException("SceneSelectAttributeOptionTemplate not found", ShotlyErrorCode.NOT_FOUND);
        }

        switch (sceneSelectAttributeOptionTemplate.sceneAttributeTemplate){
            case SceneSingleSelectAttributeTemplate singleSelectTemplate -> {
                singleSelectTemplate.options.remove(sceneSelectAttributeOptionTemplate);
            }
            case SceneMultiSelectAttributeTemplate multiSelectTemplate -> {
                multiSelectTemplate.options.remove(sceneSelectAttributeOptionTemplate);
            }
            default -> throw new ShotlyException("Invalid attribute template type", ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }

        delete(sceneSelectAttributeOptionTemplate);

        sceneSelectAttributeOptionTemplate.sceneAttributeTemplate.template.registerEdit();

        return sceneSelectAttributeOptionTemplate;
    }
}
