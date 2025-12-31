package me.kendler.yanik.repositories.scene;


import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.scene.SceneAttributeDefinitionCreateDTO;
import me.kendler.yanik.dto.scene.SceneAttributeDefinitionEditDTO;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneMultiSelectAttributeDefinitionDTO;
import me.kendler.yanik.dto.scene.attributeDefinitions.SceneSingleSelectAttributeDefinitionDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.scene.attributeDefinitions.*;
import me.kendler.yanik.model.scene.attributes.SceneAttributeBase;
import me.kendler.yanik.repositories.ShotlistRepository;

import java.util.*;
import java.util.stream.Collectors;

@Transactional
@ApplicationScoped
public class SceneAttributeDefinitionRepository implements PanacheRepository<SceneAttributeDefinitionBase> {
    @Inject
    ShotlistRepository shotlistRepository;

    @Inject
    SceneAttributeRepository sceneAttributeRepository;

    public List<SceneAttributeDefinitionBaseDTO> listAllForShotlist(UUID shotlistId) {
        Shotlist shotlist = shotlistRepository.findByIdValidated(shotlistId);

        if (shotlist == null) {
            throw new ShotlyException("Shotlist not found", ShotlyErrorCode.NOT_FOUND);
        }

        Set<SceneAttributeDefinitionBase> attributeDefinitions = shotlist.sceneAttributeDefinitions;

        List<SceneSelectAttributeOptionDefinition> options = SceneSelectAttributeOptionDefinition.find("sceneAttributeDefinition in ?1", attributeDefinitions).list();

        List<SceneAttributeDefinitionBaseDTO> attributeDefinitionDTOs = new ArrayList<>();

        //map attribute definitions to DTOs (cannot be a class method because of mapping the options)
        attributeDefinitions.forEach(definition -> {
            switch (definition) {
                case SceneSingleSelectAttributeDefinition singleSelectAttribute -> {
                    attributeDefinitionDTOs.add(new SceneSingleSelectAttributeDefinitionDTO(
                            definition.id,
                            definition.name,
                            definition.position,
                            options.stream().filter(option -> option.sceneAttributeDefinition.id.equals(definition.id)).toList()
                    ));
                }
                case SceneMultiSelectAttributeDefinition multiSelectAttribute -> {
                    attributeDefinitionDTOs.add(new SceneMultiSelectAttributeDefinitionDTO(
                            definition.id,
                            definition.name,
                            definition.position,
                            options.stream().filter(option -> option.sceneAttributeDefinition.id.equals(definition.id)).toList()
                    ));
                }
                default -> {
                    attributeDefinitionDTOs.add(definition.toDTO());
                }
            }
        });

        return attributeDefinitionDTOs.stream().sorted(Comparator.comparingInt(SceneAttributeDefinitionBaseDTO::getPosition)).collect(Collectors.toList());
    }

    public SceneAttributeDefinitionBaseDTO create(SceneAttributeDefinitionCreateDTO createDTO){
        if(createDTO == null) {
            throw new ShotlyException("SceneAttributeDefinitionCreateDTO cannot be null", ShotlyErrorCode.INVALID_INPUT);
        }
        if(createDTO.shotlistId() == null) {
            throw new ShotlyException("Shotlist ID cannot be null", ShotlyErrorCode.INVALID_INPUT);
        }
        if(createDTO.type() == null) {
            throw new ShotlyException("SceneAttributeDefinition type cannot be null", ShotlyErrorCode.INVALID_INPUT);
        }

        SceneAttributeDefinitionBase attributeDefinition = null;
        Shotlist shotlist = shotlistRepository.findByIdValidated(createDTO.shotlistId());

        shotlist.registerEdit();

        //create different definition type based on selected type in create DTO
        switch (createDTO.type()) {
            case SceneSingleSelectAttribute -> {
                attributeDefinition = new SceneSingleSelectAttributeDefinition(shotlist);
            }
            case SceneMultiSelectAttribute -> {
                attributeDefinition = new SceneMultiSelectAttributeDefinition(shotlist);
            }
            case SceneTextAttribute -> {
                attributeDefinition = new SceneTextAttributeDefinition(shotlist);
            }
        }

        if(attributeDefinition == null) {
            throw new ShotlyException("Invalid attribute definition type", ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }

        persist(attributeDefinition);

        // add the newly created definition to all existing scenes in the shotlist
        SceneAttributeDefinitionBase finalAttributeDefinition = attributeDefinition;
        shotlist.scenes.forEach(scene -> {
            sceneAttributeRepository.persist(finalAttributeDefinition.createAttribute(scene));
        });

        return attributeDefinition.toDTO();
    }

    public SceneAttributeDefinitionBaseDTO update(SceneAttributeDefinitionEditDTO editDTO) {
        SceneAttributeDefinitionBase attribute = findById(editDTO.id());
        if (attribute == null) {
            throw new ShotlyException("Attribute not found", ShotlyErrorCode.NOT_FOUND);
        }

        Shotlist shotlist = getShotlistByDefinitionId(editDTO.id());

        shotlist.registerEdit();

        if(editDTO.name() != null && !editDTO.name().isEmpty()) { //update name
            attribute.name = editDTO.name();
        }
        if(editDTO.position() != null && attribute.position != editDTO.position()){ //update position

            if(editDTO.position() < 0 || editDTO.position() >= shotlist.sceneAttributeDefinitions.size()) {
                throw new ShotlyException("Position must be between 0 and " + (shotlist.sceneAttributeDefinitions.size() - 1), ShotlyErrorCode.INVALID_INPUT);
            }

            //attr was moved back
            //0 1 2 3 New 5 6 Old
            shotlist.sceneAttributeDefinitions.stream()
                    .filter(a -> a.position < attribute.position && a.position >= editDTO.position())
                    .forEach(a -> a.position++);
            //attr was moved forward
            //0 1 2 3 Old 5 6 New
            shotlist.sceneAttributeDefinitions.stream()
                    .filter(a -> a.position > attribute.position && a.position <= editDTO.position())
                    .forEach(a -> a.position--);

            attribute.position = editDTO.position();
        }

        getEntityManager().merge(attribute);

        return attribute.toDTO();
    }

    public SceneAttributeDefinitionBaseDTO delete(Long id){
        SceneAttributeDefinitionBase attributeDefinition = findById(id);

        if(attributeDefinition != null) {
            List<SceneAttributeBase> relevantAttributes = getEntityManager()
                    .createQuery("select sa from SceneAttributeBase sa where sa.definition.id = :definitionId", SceneAttributeBase.class)
                    .setParameter("definitionId", id)
                    .getResultList();

            List<Scene> relevantScenes = getEntityManager()
                    .createQuery("select s from Scene s join s.attributes sab where sab.definition.id = :definitionId", Scene.class)
                    .setParameter("definitionId", id)
                    .getResultList();

            relevantScenes.forEach(scene -> {
                relevantAttributes.forEach(scene.attributes::remove);
            });

            Shotlist relevantShotlist = getShotlistByDefinitionId(id);

            relevantShotlist.sceneAttributeDefinitions.remove(attributeDefinition);

            relevantShotlist.registerEdit();

            return attributeDefinition.toDTO();
        }
        return null;
    }

    public Shotlist getShotlistByDefinitionId(Long id) {
        return getEntityManager().createQuery("select s from Shotlist s join s.sceneAttributeDefinitions d where d.id = :definitionId", Shotlist.class)
                .setParameter("definitionId", id)
                .getSingleResult();
    }
}
