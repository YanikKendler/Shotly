package me.kendler.yanik.dto;

public record UserActivity(
    Integer lastHour,
    Integer fourHours,
    Integer eightHours,
    Integer twentyFourHours,
    Integer sevenDays,
    Integer thirtyDays
) {
}
