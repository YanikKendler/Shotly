package me.kendler.yanik.repositories.template;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateCreateDTO;
import me.kendler.yanik.dto.template.shotAttributes.ShotAttributeTemplateBaseDTO;
import me.kendler.yanik.dto.template.shotAttributes.ShotAttributeTemplateCreateDTO;
import me.kendler.yanik.dto.template.shotAttributes.ShotAttributeTemplateEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.attributeDefinitions.ShotAttributeDefinitionBase;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.model.template.sceneAttributes.SceneAttributeTemplateBase;
import me.kendler.yanik.model.template.sceneAttributes.SceneMultiSelectAttributeTemplate;
import me.kendler.yanik.model.template.sceneAttributes.SceneSingleSelectAttributeTemplate;
import me.kendler.yanik.model.template.sceneAttributes.SceneTextAttributeTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotAttributeTemplateBase;
import me.kendler.yanik.model.template.shotAttributes.ShotMultiSelectAttributeTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotSingleSelectAttributeTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotTextAttributeTemplate;
import org.jboss.logging.Logger;

@Transactional
@ApplicationScoped
public class ShotAttributeTemplateRepository implements PanacheRepository<ShotAttributeTemplateBase> {
    @Inject
    TemplateRepository templateRepository;

    private Logger LOGGER = Logger.getLogger(ShotAttributeTemplateRepository.class);

    public ShotAttributeTemplateBaseDTO create(ShotAttributeTemplateCreateDTO createDTO) {
        if(createDTO == null) {
            throw new ShotlyException("ShotAttributeDefinitionCreateDTO cannot be null", ShotlyErrorCode.INVALID_INPUT);
        }
        if(createDTO.templateId() == null) {
            throw new ShotlyException("Template ID cannot be null", ShotlyErrorCode.NOT_FOUND);
        }
        if(createDTO.type() == null) {
            throw new ShotlyException("Attribute Type cannot be null", ShotlyErrorCode.NOT_FOUND);
        }

        ShotAttributeTemplateBase attributeTemplate = null;
        Template template = templateRepository.findById(createDTO.templateId());

        //create different definition type based on selected type in create DTO
        switch (createDTO.type()) {
            case ShotSingleSelectAttribute -> {
                attributeTemplate = new ShotSingleSelectAttributeTemplate(template);
            }
            case ShotMultiSelectAttribute -> {
                attributeTemplate = new ShotMultiSelectAttributeTemplate(template);
            }
            case ShotTextAttribute -> {
                attributeTemplate = new ShotTextAttributeTemplate(template);
            }
        }

        if(attributeTemplate == null) {
            throw new ShotlyException("Invalid attribute type", ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }

        persist(attributeTemplate);

        return attributeTemplate.toDTO();
    }

    public ShotAttributeTemplateBaseDTO update(ShotAttributeTemplateEditDTO editDTO) {
        ShotAttributeTemplateBase attribute = findById(editDTO.id());
        if (attribute == null) {
            throw new ShotlyException("Attribute not found", ShotlyErrorCode.NOT_FOUND);
        }
        if(editDTO.name() != null && !editDTO.name().isEmpty()) {
            attribute.name = editDTO.name();
        }
        if(editDTO.position() != null && attribute.position != editDTO.position()){

            if(editDTO.position() < 0 || editDTO.position() >= attribute.template.shotAttributes.size()) {
                throw new ShotlyException("Position must be between 0 and " + (attribute.template.shotAttributes.size() - 1), ShotlyErrorCode.INVALID_INPUT);
            }

            //attr was moved back
            //0 1 2 3 New 5 6 Old
            attribute.template.shotAttributes.stream()
                    .filter(a -> a.position < attribute.position && a.position >= editDTO.position())
                    .forEach(a -> a.position++);
            //attr was moved forward
            //0 1 2 3 Old 5 6 New
            attribute.template.shotAttributes.stream()
                    .filter(a -> a.position > attribute.position && a.position <= editDTO.position())
                    .forEach(a -> a.position--);

            attribute.position = editDTO.position();
        }
        return attribute.toDTO();
    }

    public ShotAttributeTemplateBaseDTO delete(Long id){
        ShotAttributeTemplateBase attribute = findById(id);
        if(attribute != null) {
            attribute.template.shotAttributes.remove(attribute);
            delete(attribute);
            return attribute.toDTO();
        }
        return null;
    }
}
