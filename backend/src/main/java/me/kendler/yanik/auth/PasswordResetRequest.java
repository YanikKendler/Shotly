package me.kendler.yanik.auth;

public record PasswordResetRequest (
        String client_id,
        String email,
        String connection
) { }
