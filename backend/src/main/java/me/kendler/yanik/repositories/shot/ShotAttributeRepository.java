package me.kendler.yanik.repositories.shot;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.shot.ShotAttributeEditDTO;
import me.kendler.yanik.dto.shot.attributes.ShotAttributeBaseDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.attributes.ShotAttributeBase;
import me.kendler.yanik.model.shot.attributes.ShotMultiSelectAttribute;
import me.kendler.yanik.model.shot.attributes.ShotSingleSelectAttribute;
import me.kendler.yanik.model.shot.attributes.ShotTextAttribute;

import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class ShotAttributeRepository implements PanacheRepository<ShotAttributeBase> {
    @Inject ShotSelectAttributeOptionDefinitionRepository shotSelectAttributeOptionDefinitionRepository;

    public ShotAttributeBaseDTO update(ShotAttributeEditDTO editDTO) {
        ShotAttributeBase attribute = findById(editDTO.id());

        switch (attribute) {
            case null -> {
                throw new ShotlyException("Attribute not found", ShotlyErrorCode.NOT_FOUND);
            }
            case ShotTextAttribute shotTextAttribute -> {
                shotTextAttribute.value = editDTO.textValue();
            }
            case ShotSingleSelectAttribute shotSingleSelectAttribute -> {
                shotSingleSelectAttribute.value = shotSelectAttributeOptionDefinitionRepository.findById(editDTO.singleSelectValue());
            }
            case ShotMultiSelectAttribute shotMultiSelectAttribute -> {
                shotMultiSelectAttribute.value = editDTO.multiSelectValue()
                        .stream()
                        .map(id -> shotSelectAttributeOptionDefinitionRepository.findById(id))
                        .collect(Collectors.toSet());
            }
            default -> {
                throw new ShotlyException("Attribute update failed", ShotlyErrorCode.IMPOSSIBLE_INPUT);
            }
        }

        getEntityManager().createQuery("select s from Shotlist s join s.shotAttributeDefinitions sad where sad = :definition"
                , Shotlist.class)
                .setParameter("definition", attribute.definition)
                .getSingleResult()
                .registerEdit();

        return attribute.toDTO();
    }

    public Shot getShotByAttributeId(Long attributeId) {
        return getEntityManager().createQuery("select s from Shot s join s.attributes a where a.id = :attributeId", Shot.class)
                .setParameter("attributeId", attributeId)
                .getSingleResult();
    }
}
