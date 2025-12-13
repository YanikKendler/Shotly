package me.kendler.yanik.dto.shotlist.collaboration;

import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.model.CollaborationState;
import me.kendler.yanik.model.CollaborationType;
import me.kendler.yanik.model.Shotlist;

import java.util.UUID;

public record CollaborationDTO(
    UUID id,
    UserDTO user,
    CollaborationType collaborationType,
    CollaborationState collaborationState,
    Shotlist shotlist //is not a dto to prevent circular dependencies
) { }
