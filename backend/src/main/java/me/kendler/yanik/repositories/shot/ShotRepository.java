package me.kendler.yanik.repositories.shot;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.Util;
import me.kendler.yanik.dto.shot.ShotDTO;
import me.kendler.yanik.dto.shot.ShotEditDTO;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.repositories.scene.SceneRepository;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class ShotRepository implements PanacheRepositoryBase<Shot, UUID> {
    @Inject
    SceneRepository sceneRepository;

    private static final Logger LOGGER = Logger.getLogger(ShotRepository.class);


    public List<ShotDTO> findAllForScene(UUID sceneId) {
        return list("scene.id = ?1 order by position", sceneId).stream().map(Shot::toDTO).toList();
    }

    public ShotDTO create(UUID sceneId) {
        //return new ShotDTO(UUID.randomUUID(), null, null, 0, false, null);

        long start = System.nanoTime();

        Scene scene = sceneRepository.findById(sceneId);
        Shot shot = new Shot(scene);
        scene.shotlist.registerEdit();
        persist(shot);

        Util.timer(start, "create shot");
        return shot.toDTO();
    }

    public ShotDTO update(ShotEditDTO editDTO) {
        Shot shot = findById(editDTO.id());

        if(editDTO.position() < 0 || editDTO.position() >= shot.scene.shots.size()) {
            throw new IllegalArgumentException("Position must be between 0 and " + (shot.scene.shots.size() - 1));
        }

        if(shot.position != editDTO.position()){
            //shot was moved back
            //0 1 2 3 New 5 6 Old
            shot.scene.shots.stream()
                    .filter(s -> s.position < shot.position && s.position >= editDTO.position())
                    .forEach(a -> a.position++);
            //shot was moved forward
            //0 1 2 3 Old 5 6 New
            shot.scene.shots.stream()
                    .filter(s -> s.position > shot.position && s.position <= editDTO.position())
                    .forEach(a -> a.position--);
        }

        shot.position = editDTO.position();

        shot.scene.shotlist.registerEdit();

        return shot.toDTO();
    }

    public ShotDTO delete(UUID id) {
        Shot shot = findById(id);

        shot.attributes.forEach(PanacheEntityBase::delete);

        shot.scene.shots.remove(shot);

        //update positions of all shots after this one
        shot.scene.shots.stream()
                .filter(s -> s.position > shot.position)
                .forEach(a -> a.position--);

        shot.scene.shotlist.registerEdit();

        delete(shot);

        return shot.toDTO();
    }
}