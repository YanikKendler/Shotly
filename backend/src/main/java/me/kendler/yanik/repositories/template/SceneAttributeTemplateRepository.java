package me.kendler.yanik.repositories.template;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateBaseDTO;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateCreateDTO;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateEditDTO;
import me.kendler.yanik.dto.template.shotAttributes.ShotAttributeTemplateEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneMultiSelectAttributeDefinition;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSingleSelectAttributeDefinition;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneTextAttributeDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotMultiSelectAttributeDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotSingleSelectAttributeDefinition;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotTextAttributeDefinition;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.model.template.sceneAttributes.SceneAttributeTemplateBase;
import me.kendler.yanik.model.template.sceneAttributes.SceneMultiSelectAttributeTemplate;
import me.kendler.yanik.model.template.sceneAttributes.SceneSingleSelectAttributeTemplate;
import me.kendler.yanik.model.template.sceneAttributes.SceneTextAttributeTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotAttributeTemplateBase;

@Transactional
@ApplicationScoped
public class SceneAttributeTemplateRepository implements PanacheRepository<SceneAttributeTemplateBase> {
    @Inject
    TemplateRepository templateRepository;

    public SceneAttributeTemplateBaseDTO create(SceneAttributeTemplateCreateDTO createDTO) {
        if(createDTO == null) {
            throw new ShotlyException("SceneAttributeDefinitionCreateDTO cannot be null", ShotlyErrorCode.INVALID_INPUT);
        }
        if(createDTO.templateId() == null) {
            throw new ShotlyException("Template ID cannot be null", ShotlyErrorCode.NOT_FOUND);
        }
        if(createDTO.type() == null) {
            throw new ShotlyException("Attribute Type cannot be null", ShotlyErrorCode.NOT_FOUND);
        }

        SceneAttributeTemplateBase attributeTemplate = null;
        Template template = templateRepository.findById(createDTO.templateId());


        //create different definition type based on selected type in create DTO
        switch (createDTO.type()) {
            case SceneSingleSelectAttribute -> {
                attributeTemplate = new SceneSingleSelectAttributeTemplate(template);
            }
            case SceneMultiSelectAttribute -> {
                attributeTemplate = new SceneMultiSelectAttributeTemplate(template);
            }
            case SceneTextAttribute -> {
                attributeTemplate = new SceneTextAttributeTemplate(template);
            }
        }

        if(attributeTemplate == null) {
            throw new ShotlyException("Invalid attribute type", ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }

        persist(attributeTemplate);

        template.registerEdit();

        return attributeTemplate.toDTO();
    }

    public SceneAttributeTemplateBaseDTO update(SceneAttributeTemplateEditDTO editDTO) {
        SceneAttributeTemplateBase attribute = findById(editDTO.id());
        if (attribute == null) {
            throw new ShotlyException("Attribute not found", ShotlyErrorCode.NOT_FOUND);
        }
        if(editDTO.name() != null && !editDTO.name().isEmpty()) {
            attribute.name = editDTO.name();
        }
        if(editDTO.position() != null && attribute.position != editDTO.position()){

            if(editDTO.position() < 0 || editDTO.position() >= attribute.template.sceneAttributes.size()) {
                throw new ShotlyException("Position must be between 0 and " + (attribute.template.sceneAttributes.size() - 1), ShotlyErrorCode.INVALID_INPUT);
            }

            //attr was moved back
            //0 1 2 3 New 5 6 Old
            attribute.template.sceneAttributes.stream()
                    .filter(a -> a.position < attribute.position && a.position >= editDTO.position())
                    .forEach(a -> a.position++);
            //attr was moved forward
            //0 1 2 3 Old 5 6 New
            attribute.template.sceneAttributes.stream()
                    .filter(a -> a.position > attribute.position && a.position <= editDTO.position())
                    .forEach(a -> a.position--);

            attribute.position = editDTO.position();
        }

        attribute.template.registerEdit();

        return attribute.toDTO();
    }

    public SceneAttributeTemplateBaseDTO delete(Long id){
        SceneAttributeTemplateBase attribute = findById(id);

        if(attribute == null) {
            throw new ShotlyException("Attribute not found", ShotlyErrorCode.NOT_FOUND);
        }

        attribute.template.sceneAttributes.remove(attribute);

        attribute.template.sceneAttributes.stream()
            .filter(a -> a.position > attribute.position)
            .forEach(a -> a.position--);

        delete(attribute);

        attribute.template.registerEdit();

        return attribute.toDTO();
    }
}
