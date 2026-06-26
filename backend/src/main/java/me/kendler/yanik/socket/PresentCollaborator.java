package me.kendler.yanik.socket;

import me.kendler.yanik.dto.user.UserMinimalDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class PresentCollaborator {
    public UserMinimalDTO user;
    public UUID selectedSceneId = null;
    public LocalDateTime joinedAt = LocalDateTime.now();

    public PresentCollaborator(UserMinimalDTO user, UUID selectedSceneId) {
        this.user = user;
        this.selectedSceneId = selectedSceneId;
    }

    public PresentCollaborator(UserMinimalDTO user) {
        this.user = user;
    }
}
