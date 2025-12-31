package me.kendler.yanik.repositories.scene;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.scene.SceneDTO;
import me.kendler.yanik.dto.scene.SceneEditDTO;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.scene.Scene;
import me.kendler.yanik.model.shot.Shot;
import me.kendler.yanik.repositories.ShotlistRepository;
import me.kendler.yanik.repositories.shot.ShotRepository;

import java.util.List;
import java.util.UUID;

@Transactional
@ApplicationScoped
public class SceneRepository implements PanacheRepositoryBase<Scene, UUID> {
    @Inject
    ShotlistRepository shotlistRepository;

    @Inject
    ShotRepository shotRepository;

    public Scene findByIdValidated(UUID id){
        Scene scene = findById(id);
        if (scene == null) {
            throw new ShotlyException("This Scene does not exist", ShotlyErrorCode.NOT_FOUND);
        }
        return scene;
    }

    public List<SceneDTO> listAllForShotlist(UUID shotlistId) {
        return list("shotlist.id", shotlistId).stream().map(Scene::toDTO).toList();
    }

    public SceneDTO create(UUID shotlistId) {
        Shotlist shotlist = shotlistRepository.findByIdValidated(shotlistId);
        shotlist.registerEdit();
        Scene scene = new Scene(shotlist);
        persist(scene);

        return scene.toDTO();
    }

    public SceneDTO update(SceneEditDTO editDTO) {
        Scene scene = findById(editDTO.id());

        if(editDTO.position() < 0 || editDTO.position() >= scene.shotlist.scenes.size()) {
            throw new ShotlyException("Position must be between 0 and " + (scene.shotlist.scenes.size() - 1), ShotlyErrorCode.INVALID_INPUT);
        }

        if(scene.position != editDTO.position()){
            //scene was moved back
            //0 1 2 3 New 5 6 Old
            scene.shotlist.scenes.stream()
                    .filter(s -> s.position < scene.position && s.position >= editDTO.position())
                    .forEach(a -> a.position++);
            //scene was moved forward
            //0 1 2 3 Old 5 6 New
            scene.shotlist.scenes.stream()
                    .filter(s -> s.position > scene.position && s.position <= editDTO.position())
                    .forEach(a -> a.position--);
        }

        scene.position = editDTO.position();

        scene.shotlist.registerEdit();

        return scene.toDTO();
    }

    public SceneDTO delete(UUID id) {
        Scene scene = findById(id);
        if (scene != null) {
            scene.shotlist.scenes.stream().filter(s -> s.position > scene.position).forEach(s -> s.position--);

            for (Shot shot : scene.shots) {
                shotRepository.delete(shot);
            }

            scene.shotlist.registerEdit();

            delete(scene);

            return scene.toDTO();
        }
        return null;
    }
}
