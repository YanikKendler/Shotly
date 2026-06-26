package me.kendler.yanik.socket.payload;

import io.smallrye.graphql.api.Union;

/**
 * The payload of the ShotlistUpdateDTO that is sent on every update to the shotlist
 * The payload contains the actual data that was changed (and additional stuff for properly updating the client state)
 * Only exists to group all payloads in one type
 */
@Union
public interface ShotlistUpdatePayload { }
