package me.kendler.yanik.socket.payload;

import me.kendler.yanik.dto.shot.ShotDTO;

import java.time.ZonedDateTime;
import java.util.UUID;

public record ShotPayload(
    UUID id,
    UUID sceneId,
    int position,
    boolean isSubshot,
    ZonedDateTime createdAt
) implements ShotlistUpdatePayload {
    public ShotPayload { }

    public ShotPayload(ShotDTO shotDTO) {
        this(
            shotDTO.id(),
            shotDTO.sceneId(),
            shotDTO.position(),
            shotDTO.isSubshot(),
            shotDTO.createdAt()
        );
    }
}
