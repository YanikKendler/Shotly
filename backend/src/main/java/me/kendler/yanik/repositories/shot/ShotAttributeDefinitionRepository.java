package me.kendler.yanik.repositories.shot;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.shot.ShotAttributeDefinitionCreateDTO;
import me.kendler.yanik.dto.shot.ShotAttributeDefinitionEditDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotAttributeDefinitionBaseDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotMultiSelectAttributeDefinitionDTO;
import me.kendler.yanik.dto.shot.attributeDefinitions.ShotSingleSelectAttributeDefinitionDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.model.shot.attributeDefinitions.*;
import me.kendler.yanik.model.shot.attributes.ShotAttributeBase;
import me.kendler.yanik.repositories.ShotlistRepository;
import org.jboss.logging.Logger;

import java.util.*;

@ApplicationScoped
@Transactional
public class ShotAttributeDefinitionRepository implements PanacheRepository<ShotAttributeDefinitionBase> {
    @Inject
    ShotlistRepository shotlistRepository;

    @Inject
    ShotAttributeRepository shotAttributeRepository;

    private static final Logger LOGGER = Logger.getLogger(ShotAttributeDefinitionRepository.class);

    public List<ShotAttributeDefinitionBaseDTO> getAll(UUID shotlistId) {
        Shotlist shotlist = shotlistRepository.findByIdValidated(shotlistId);

        if (shotlist == null) {
            throw new ShotlyException("Shotlist not found", ShotlyErrorCode.NOT_FOUND);
        }

        if(shotlist.shotAttributeDefinitions == null || shotlist.shotAttributeDefinitions.isEmpty()) {
            return Collections.emptyList();
        }

        Set<ShotAttributeDefinitionBase> attributeDefinitions = shotlist.shotAttributeDefinitions;

        List<ShotSelectAttributeOptionDefinition> options = ShotSelectAttributeOptionDefinition.find("shotAttributeDefinition in ?1 order by name", attributeDefinitions).list();

        List<ShotAttributeDefinitionBaseDTO> attributeDefinitionDTOs = new ArrayList<>();

        //map attribute definitions to DTOs (cannot be a class method because of mapping the options)
        attributeDefinitions.forEach(definition -> {
            switch (definition) {
                case ShotSingleSelectAttributeDefinition singleSelectAttribute -> {
                    attributeDefinitionDTOs.add(new ShotSingleSelectAttributeDefinitionDTO(
                            definition.id,
                            definition.name,
                            definition.position,
                            options.stream().filter(option -> option.shotAttributeDefinition.id.equals(definition.id)).toList()
                    ));
                }
                case ShotMultiSelectAttributeDefinition multiSelectAttribute -> {
                    attributeDefinitionDTOs.add(new ShotMultiSelectAttributeDefinitionDTO(
                            definition.id,
                            definition.name,
                            definition.position,
                            options.stream().filter(option -> option.shotAttributeDefinition.id.equals(definition.id)).toList()
                    ));
                }
                default -> {
                    attributeDefinitionDTOs.add(definition.toDTO());
                }
            }
        });

        return attributeDefinitionDTOs.stream().sorted(Comparator.comparingInt(ShotAttributeDefinitionBaseDTO::getPosition)).toList();
    }

    public ShotAttributeDefinitionBaseDTO create(ShotAttributeDefinitionCreateDTO createDTO) {
        if(createDTO == null) {
            throw new ShotlyException("ShotAttributeDefinitionCreateDTO cannot be null", ShotlyErrorCode.INVALID_INPUT);
        }
        if(createDTO.shotlistId() == null) {
            throw new ShotlyException("Shotlist ID cannot be null", ShotlyErrorCode.NOT_FOUND);
        }
        if(createDTO.type() == null) {
            throw new ShotlyException("ShotAttributeDefinition type cannot be null", ShotlyErrorCode.NOT_FOUND);
        }

        ShotAttributeDefinitionBase attributeDefinition = null;
        Shotlist shotlist = shotlistRepository.findByIdValidated(createDTO.shotlistId());

        shotlist.registerEdit();

        //create different definition type based on selected type in create DTO
        switch (createDTO.type()) {
            case ShotSingleSelectAttribute -> {
                attributeDefinition = new ShotSingleSelectAttributeDefinition(shotlist);
            }
            case ShotMultiSelectAttribute -> {
                attributeDefinition = new ShotMultiSelectAttributeDefinition(shotlist);
            }
            case ShotTextAttribute -> {
                attributeDefinition = new ShotTextAttributeDefinition(shotlist);
            }
        }

        if(attributeDefinition == null) {
            throw new ShotlyException("Invalid attribute definition type", ShotlyErrorCode.IMPOSSIBLE_INPUT);
        }

        persist(attributeDefinition);

        //add the newly created definition to all existing shots
        ShotAttributeDefinitionBase finalAttributeDefinition = attributeDefinition;
        shotlist.scenes.forEach(scene -> {
            scene.shots.forEach(shot -> {
                shotAttributeRepository.persist(finalAttributeDefinition.createAttribute(shot));
            });
        });

        return attributeDefinition.toDTO();
    }

    public ShotAttributeDefinitionBaseDTO update(ShotAttributeDefinitionEditDTO editDTO) {
        ShotAttributeDefinitionBase attribute = findById(editDTO.id());
        if (attribute == null) {
            throw new ShotlyException("Attribute not found", ShotlyErrorCode.NOT_FOUND);
        }

        Shotlist shotlist = getShotlistByDefinitionId(editDTO.id());
        shotlist.registerEdit();

        if(editDTO.name() != null && !editDTO.name().isEmpty()) {
            attribute.name = editDTO.name();
        }
        if(editDTO.position() != null && attribute.position != editDTO.position()){

            if(editDTO.position() < 0 || editDTO.position() >= shotlist.shotAttributeDefinitions.size()) {
                throw new ShotlyException("Position must be between 0 and " + (shotlist.shotAttributeDefinitions.size() - 1), ShotlyErrorCode.INVALID_INPUT);
            }

            //attr was moved back
            //0 1 2 3 New 5 6 Old
            shotlist.shotAttributeDefinitions.stream()
                    .filter(a -> a.position < attribute.position && a.position >= editDTO.position())
                    .forEach(a -> a.position++);
            //attr was moved forward
            //0 1 2 3 Old 5 6 New
            shotlist.shotAttributeDefinitions.stream()
                    .filter(a -> a.position > attribute.position && a.position <= editDTO.position())
                    .forEach(a -> a.position--);

            attribute.position = editDTO.position();
        }
        return attribute.toDTO();
    }

    public ShotAttributeDefinitionBaseDTO delete(Long id){
        ShotAttributeDefinitionBase attributeDefinition = findById(id);

        if(attributeDefinition != null) {
            List<ShotAttributeBase> relevantAttributes = getEntityManager()
                    .createQuery("select sa from ShotAttributeBase sa where sa.definition.id = :definitionId", ShotAttributeBase.class)
                    .setParameter("definitionId", id)
                    .getResultList();

            List<Shot> relevantShots = getEntityManager()
                    .createQuery("select s from Shot s join s.attributes sab where sab.definition.id = :definitionId", Shot.class)
                    .setParameter("definitionId", id)
                    .getResultList();

            relevantShots.forEach(shot -> {
                relevantAttributes.forEach(shot.attributes::remove);
            });

            Shotlist relevantShotlist = getShotlistByDefinitionId(id);

            relevantShotlist.shotAttributeDefinitions.remove(attributeDefinition);

            relevantShotlist.registerEdit();

            return attributeDefinition.toDTO();
        }
        return null;
    }

    public Shotlist getShotlistByDefinitionId(Long id) {
        Shotlist result = getEntityManager()
                .createQuery("select s from Shotlist s join s.shotAttributeDefinitions d where d.id = :definitionId", Shotlist.class)
                .setParameter("definitionId", id)
                .getSingleResult();
        if(result == null) {
            throw new ShotlyException("Shotlist not found for definition ID: " + id, ShotlyErrorCode.NOT_FOUND);
        }

        return result;
    }
}
