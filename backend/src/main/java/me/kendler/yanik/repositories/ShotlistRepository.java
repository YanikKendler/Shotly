package me.kendler.yanik.repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.shotlist.ShotlistCollection;
import me.kendler.yanik.dto.shotlist.ShotlistCreateDTO;
import me.kendler.yanik.dto.shotlist.ShotlistDTO;
import me.kendler.yanik.dto.shotlist.ShotlistEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Collaboration;
import me.kendler.yanik.model.User;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.UserTier;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.repositories.scene.SceneRepository;
import me.kendler.yanik.repositories.template.TemplateRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class ShotlistRepository implements PanacheRepositoryBase<Shotlist, UUID> {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(ShotlistRepository.class);
    @Inject
    UserRepository userRepository;

    @Inject
    SceneRepository sceneRepository;

    @Inject
    TemplateRepository templateRepository;

    @Inject
    CollaborationRepository collaborationRepository;

    private static final Logger LOGGER = Logger.getLogger(ShotlistRepository.class);

    public Shotlist findByIdValidated(UUID id){
        Shotlist shotlist = findById(id);
        if (shotlist == null) {
            throw new ShotlyException("This Shotlist does not exist", ShotlyErrorCode.NOT_FOUND);
        }
        return shotlist;
    }

    public ShotlistDTO findAsDTO(UUID id) {
        Shotlist shotlist = findById(id);
        if (shotlist == null) {
            throw new ShotlyException("This Shotlist does not exist", ShotlyErrorCode.NOT_FOUND);
        }
        return shotlist.toDTO();
    }

    public ShotlistCollection findAllForUser(JsonWebToken jwt) {
        User user = userRepository.findOrCreateByJWT(jwt);

        List<ShotlistDTO> personalShotlists = user
                .shotlists
                .stream()
                .map(Shotlist::toDTO)
                .toList();

        List<ShotlistDTO> sharedShotlists = find(
                "select distinct s from Shotlist s join s.collaborations c where c.user.id = ?1 AND c.collaborationState = 'ACCEPTED'",
                user.id
        )
            .stream()
            .map(Shotlist::toDTO)
            .toList();

        return new ShotlistCollection(
            personalShotlists,
            sharedShotlists
        );
    }

    public ShotlistDTO create(ShotlistCreateDTO createDTO, JsonWebToken jwt){
        User user = userRepository.findOrCreateByJWT(jwt);

        if(user.tier == UserTier.BASIC && user.shotlists.size() >= 1){
            throw new ShotlyException("Basic users can only have one shotlist", ShotlyErrorCode.SHOTLIST_LIMIT_REACHED);
        }

        Shotlist shotlist;

        if(createDTO.templateId() == null) { // no template was provided, creating a blank shotlist
            shotlist = new Shotlist(user, createDTO.name());
        }
        else {
            Template template = templateRepository.findById(createDTO.templateId());
            if(template == null) {
                throw new ShotlyException("Template not found", ShotlyErrorCode.NOT_FOUND);
            }
            shotlist = new Shotlist(user, template, createDTO.name());
        }

        LOGGER.infof("Created new shotlist: %s for user %s", shotlist.name, user.email);

        persist(shotlist);

        sceneRepository.create(shotlist.id);

        return shotlist.toDTO();
    }

    public ShotlistDTO update(ShotlistEditDTO editDTO){
        Shotlist shotlist = findById(editDTO.id());
        shotlist.name = editDTO.name();
        shotlist.registerEdit();
        return shotlist.toDTO();
    }

    public ShotlistDTO delete(UUID id) {
        Shotlist shotlist = findById(id);
        if (shotlist != null) {
            for (Scene scene : shotlist.scenes) {
                sceneRepository.delete(scene.id);
            }
            for (Collaboration collab : shotlist.collaborations){
                collaborationRepository.delete(collab.id);
            }
            delete(shotlist);
            return shotlist.toDTO();
        }
        return null;
    }
}
