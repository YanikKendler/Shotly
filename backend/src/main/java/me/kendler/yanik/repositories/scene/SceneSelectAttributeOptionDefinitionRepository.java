package me.kendler.yanik.repositories.scene;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.scene.SceneSelectAttributeOptionCreateDTO;
import me.kendler.yanik.dto.scene.SceneSelectAttributeOptionEditDTO;
import me.kendler.yanik.dto.scene.SceneSelectAttributeOptionSearchDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneAttributeDefinitionBase;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneMultiSelectAttributeDefinition;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSelectAttributeOptionDefinition;
import me.kendler.yanik.model.scene.attributeDefinitions.SceneSingleSelectAttributeDefinition;
import me.kendler.yanik.model.scene.attributes.SceneMultiSelectAttribute;

import java.util.List;

@ApplicationScoped
@Transactional
public class SceneSelectAttributeOptionDefinitionRepository implements PanacheRepository<SceneSelectAttributeOptionDefinition> {
    @Inject
    SceneAttributeDefinitionRepository sceneAttributeDefinitionRepository;

    public SceneSelectAttributeOptionDefinition create(SceneSelectAttributeOptionCreateDTO createDTO){
        SceneAttributeDefinitionBase sceneAttributeDefinition = sceneAttributeDefinitionRepository.findById(createDTO.attributeDefinitionId());
        SceneSelectAttributeOptionDefinition sceneSelectAttributeOptionDefinition = new SceneSelectAttributeOptionDefinition(createDTO.name(), sceneAttributeDefinition);
        persist(sceneSelectAttributeOptionDefinition);

        getEntityManager().createQuery("select s from Shotlist s join s.sceneAttributeDefinitions sad where sad = :definition"
                , Shotlist.class)
                .setParameter("definition", sceneAttributeDefinition)
                .getSingleResult()
        .registerEdit();

        return sceneSelectAttributeOptionDefinition;
    }

    public List<SceneSelectAttributeOptionDefinition> search(SceneSelectAttributeOptionSearchDTO searchDTO){
        return find("lower(name) like lower(concat('%', ?1, '%')) " +
                    "and sceneAttributeDefinition.id = ?2 " +
                    "order by name",
                    searchDTO.searchTerm(),
                    searchDTO.sceneAttributeDefinitionId()
        )
        .list();
    }

    public SceneSelectAttributeOptionDefinition update(SceneSelectAttributeOptionEditDTO editDTO) {
        SceneSelectAttributeOptionDefinition option = findById(editDTO.id());
        if (option == null) {
            throw new ShotlyException("SceneSelectAttributeOptionDefinition not found", ShotlyErrorCode.NOT_FOUND);
        }
        option.name = editDTO.name();

        getEntityManager().createQuery("select s from Shotlist s join s.sceneAttributeDefinitions sad where sad = :definition"
                , Shotlist.class)
                .setParameter("definition", option.sceneAttributeDefinition)
                .getSingleResult()
        .registerEdit();

        return option;
    }

    public SceneSelectAttributeOptionDefinition delete(Long id){
        SceneSelectAttributeOptionDefinition sceneSelectAttributeOptionDefinition = findById(id);

        if(sceneSelectAttributeOptionDefinition == null) {
            throw new ShotlyException("SceneSelectAttributeOptionDefinition not found", ShotlyErrorCode.NOT_FOUND);
        }

        switch (sceneSelectAttributeOptionDefinition.sceneAttributeDefinition){
            case SceneMultiSelectAttributeDefinition attributeDefinition: {
                List<SceneMultiSelectAttribute> relevantAttributes = getEntityManager()
                        .createQuery("select sa from SceneMultiSelectAttribute sa where sa.definition = :definition", SceneMultiSelectAttribute.class)
                        .setParameter("definition", attributeDefinition)
                        .getResultList();

                for (SceneMultiSelectAttribute relevantAttribute : relevantAttributes) {
                    relevantAttribute.value.remove(sceneSelectAttributeOptionDefinition);
                }

                break;
            }
            case SceneSingleSelectAttributeDefinition attributeDefinition: {
                getEntityManager().createQuery("update SceneSingleSelectAttribute sa set sa.value = null where sa.definition = :definition")
                        .setParameter("definition", attributeDefinition)
                        .executeUpdate();
                break;
            }
            default:
                throw new ShotlyException("Unexpected value: " + sceneSelectAttributeOptionDefinition.sceneAttributeDefinition, ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }

        delete(sceneSelectAttributeOptionDefinition);

         getEntityManager().createQuery("select s from Shotlist s join s.sceneAttributeDefinitions sad where sad = :definition"
                , Shotlist.class)
                .setParameter("definition", sceneSelectAttributeOptionDefinition.sceneAttributeDefinition)
                .getSingleResult()
        .registerEdit();

         return sceneSelectAttributeOptionDefinition;
    }
}
