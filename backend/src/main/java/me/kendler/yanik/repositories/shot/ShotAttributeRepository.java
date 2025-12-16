package me.kendler.yanik.repositories.shot;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.shot.ShotAttributeEditDTO;
import me.kendler.yanik.dto.shot.attributes.ShotAttributeBaseDTO;
import me.kendler.yanik.model.Shotlist;
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
                throw new IllegalArgumentException("Attribute not found");
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
                throw new IllegalArgumentException("Attribute update failed");
            }
        }

        getEntityManager().createQuery("select s from Shotlist s join s.shotAttributeDefinitions sad where sad = :definition"
                , Shotlist.class)
                .setParameter("definition", attribute.definition)
                .getSingleResult()
                .registerEdit();

        return attribute.toDTO();
    }
}
