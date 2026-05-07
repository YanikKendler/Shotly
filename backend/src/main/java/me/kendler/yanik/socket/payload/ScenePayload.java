package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.scene.SceneDTO;
import java.time.ZonedDateTime;
import java.util.UUID;

public record ScenePayload(
    UUID id,
    int position,
    ZonedDateTime createdAt,
    int shotCount
) implements ShotlistUpdatePayload {
    public ScenePayload { }

    public ScenePayload(SceneDTO sceneDTO) {
        this(
            sceneDTO.id(),
            sceneDTO.position(),
            sceneDTO.createdAt(),
            sceneDTO.shotCount()
        );
    }
}
