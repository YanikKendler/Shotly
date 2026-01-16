package me.kendler.yanik.repositories.template;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.shot.ShotSelectAttributeOptionCreateDTO;
import me.kendler.yanik.dto.shot.ShotSelectAttributeOptionEditDTO;
import me.kendler.yanik.dto.shot.ShotSelectAttributeOptionSearchDTO;
import me.kendler.yanik.dto.template.shotAttributes.ShotSelectAttributeOptionTemplateEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;

import me.kendler.yanik.model.shot.attributes.ShotMultiSelectAttribute;
import me.kendler.yanik.model.template.shotAttributes.ShotAttributeTemplateBase;
import me.kendler.yanik.model.template.shotAttributes.ShotMultiSelectAttributeTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotSelectAttributeOptionTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotSingleSelectAttributeTemplate;
import org.jboss.logging.Logger;

@ApplicationScoped
@Transactional
public class ShotSelectAttributeOptionTemplateRepository implements PanacheRepository<ShotSelectAttributeOptionTemplate> {
    @Inject
    ShotAttributeTemplateRepository shotAttributeTemplateRepository;

    private static final Logger LOGGER = Logger.getLogger(ShotSelectAttributeOptionTemplateRepository.class);

    public ShotSelectAttributeOptionTemplate create(Long attributeTemplateId) {
        ShotAttributeTemplateBase shotAttributeTemplate = shotAttributeTemplateRepository.findById(attributeTemplateId);

        if (shotAttributeTemplate == null) {
            throw new ShotlyException("ShotAttributeTemplate not found with ID: " + attributeTemplateId, ShotlyErrorCode.NOT_FOUND);
        }

        ShotSelectAttributeOptionTemplate shotSelectAttributeOptionTemplate = new ShotSelectAttributeOptionTemplate(shotAttributeTemplate);

        persist(shotSelectAttributeOptionTemplate);

        return shotSelectAttributeOptionTemplate;
    }

    public ShotSelectAttributeOptionTemplate update(ShotSelectAttributeOptionTemplateEditDTO editDTO) {
        ShotSelectAttributeOptionTemplate option = findById(editDTO.id());
        if (option == null) {
            throw new ShotlyException("ShotSelectAttributeOptionTemplate not found", ShotlyErrorCode.NOT_FOUND);
        }
        option.name = editDTO.name();

        return option;
    }

    public ShotSelectAttributeOptionTemplate delete(Long id){
        ShotSelectAttributeOptionTemplate shotSelectAttributeOptionTemplate = findById(id);

        if(shotSelectAttributeOptionTemplate == null) {
            throw new ShotlyException("ShotSelectAttributeOptionTemplate not found", ShotlyErrorCode.NOT_FOUND);
        }

        switch (shotSelectAttributeOptionTemplate.shotAttributeTemplate){
            case ShotSingleSelectAttributeTemplate singleSelectTemplate -> {
                singleSelectTemplate.options.remove(shotSelectAttributeOptionTemplate);
            }
            case ShotMultiSelectAttributeTemplate multiSelectTemplate -> {
                multiSelectTemplate.options.remove(shotSelectAttributeOptionTemplate);
            }
            default -> throw new ShotlyException("Invalid attribute template type", ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }

        delete(shotSelectAttributeOptionTemplate);

        return shotSelectAttributeOptionTemplate;
    }
}
