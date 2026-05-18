package me.kendler.yanik.auth;

public record Auth0TokenResponse(
    String access_token,
    String token_type
) { }
