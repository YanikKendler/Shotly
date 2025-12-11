package me.kendler.yanik.dto.shotlist.collaboration;

import me.kendler.yanik.dto.shotlist.ShotlistDTO;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.model.CollaborationState;
import me.kendler.yanik.model.CollaboratorRole;

import java.util.UUID;

public record CollaborationDTO(
    UUID id,
    UserDTO user,
    CollaboratorRole collaboratorRole,
    CollaborationState collaborationState
) { }
