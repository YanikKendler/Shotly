package me.kendler.yanik.socket.payload;


public record EmptyPayload(
    // GraphQL requires at least one field to exist
    boolean success
) implements ShotlistUpdatePayload {
    public EmptyPayload() {
        this(true);
    }
}
