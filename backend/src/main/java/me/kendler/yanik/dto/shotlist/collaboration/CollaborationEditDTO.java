package me.kendler.yanik.dto.shotlist.collaboration;

import me.kendler.yanik.model.CollaborationState;
import me.kendler.yanik.model.CollaborationType;

import java.util.UUID;

public record CollaborationEditDTO(
        UUID id,
        CollaborationType collaborationType,
        CollaborationState collaborationState
) { }
