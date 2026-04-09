package me.kendler.yanik.dto.shotlist;

import java.util.List;

public record ShotlistCollection (
    List<ShotlistDTO> personal,
    List<ShotlistDTO> shared
){ }
