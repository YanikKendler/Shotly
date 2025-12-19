package me.kendler.yanik.socket.payload;

import java.util.UUID;

public record SelectedCellPayload(
    int row,
    int column,
    UUID sceneId
) implements ShotlistUpdatePayload { }
