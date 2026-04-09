package me.kendler.yanik.repositories.scene;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.scene.SceneAttributeEditDTO;
import me.kendler.yanik.dto.scene.attributes.SceneAttributeBaseDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.attributes.SceneAttributeBase;
import me.kendler.yanik.model.scene.attributes.SceneMultiSelectAttribute;
import me.kendler.yanik.model.scene.attributes.SceneSingleSelectAttribute;
import me.kendler.yanik.model.scene.attributes.SceneTextAttribute;

import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class SceneAttributeRepository implements PanacheRepository<SceneAttributeBase> {
    @Inject
    SceneSelectAttributeOptionDefinitionRepository sceneSelectAttributeOptionDefinitionRepository;

    public SceneAttributeBaseDTO update(SceneAttributeEditDTO editDTO) {
        SceneAttributeBase attribute = findById(editDTO.id());

        getEntityManager().createQuery("select s from Shotlist s join s.sceneAttributeDefinitions sad where sad = :definition"
                , Shotlist.class)
                .setParameter("definition", attribute.definition)
                .getSingleResult()
        .registerEdit();

        switch (attribute) {
            case null -> {
                throw new ShotlyException("Attribute not found", ShotlyErrorCode.NOT_FOUND);
            }
            case SceneTextAttribute sceneTextAttribute -> {
                sceneTextAttribute.value = editDTO.textValue();
            }
            case SceneSingleSelectAttribute sceneSingleSelectAttribute -> {
                sceneSingleSelectAttribute.value = sceneSelectAttributeOptionDefinitionRepository.findById(editDTO.singleSelectValue());
            }
            case SceneMultiSelectAttribute sceneMultiSelectAttribute -> {
                sceneMultiSelectAttribute.value = editDTO.multiSelectValue()
                        .stream()
                        .map(id -> sceneSelectAttributeOptionDefinitionRepository.findById(id))
                        .collect(Collectors.toSet());
            }
            default -> {
                throw new ShotlyException("Attribute update failed", ShotlyErrorCode.IMPOSSIBLE_INPUT);
            }
        }

        return attribute.toDTO();
    }
}
