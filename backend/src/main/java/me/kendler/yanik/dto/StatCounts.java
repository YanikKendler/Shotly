package me.kendler.yanik.dto;

public record StatCounts(
    Integer lastHour,
    Integer fourHours,
    Integer eightHours,
    Integer twentyFourHours,
    Integer sevenDays,
    Integer thirtyDays
) {
}
