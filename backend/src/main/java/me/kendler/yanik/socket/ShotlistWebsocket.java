package me.kendler.yanik.socket;

import io.quarkus.websockets.next.*;
import jakarta.inject.Inject;

import java.util.*;

/*
 * about web sockets..
 * so i just spent like 2 hours trying to figure out how to implement websocket rooms in a clean way
 * i created and scrapped 3 classes until i gave up.. i guess something that was easy in the old quarkus websocket api
 * is now only possible with this ugly workaround of storing connection ids because there apparently is no way to just
 * store a singular immutable reference to a connection anymore instead there is this new system of injecting a WebSocketConnection
 * that represents the current connection.. which then obviously changes with each client so there is no way of storing that
 * i don't understand the benefits of packing the other connections this way and why there is no native support for rooms
 *
 * A few days later i just found out that graphql has subscriptions which are basically websockets with rooms built in
 * so i should have used that.. but tbh this works and except for the fuckery i had to do because the __typename field
 * was obviously missing from the payloads because graphql only adds that during serialization..
 * TODO This approach works just fine, may migrate it later to make the api cleaner
 */

/**
 * Handles syncing user interactions between collaborators
 * most the functionality is delegated to ShotlistWebsocketService
 */
@WebSocket(path = "/shotlist/{shotlistId}/{userId}")
public class ShotlistWebsocket {
    @Inject
    WebSocketConnection connection;

    @Inject
    ShotlistWebsocketService websocketService;

    @OnOpen
    public void onOpen() {
        UUID shotlistId = UUID.fromString(connection.pathParam("shotlistId"));
        UUID userId = UUID.fromString(connection.pathParam("userId"));

        websocketService.addToRoom(shotlistId, userId, connection.id());
        websocketService.sendPresentCollaborators(shotlistId, connection); //to display currently active collaborators to user
    }

    @OnClose
    public void onClose() {
        UUID shotlistId = UUID.fromString(connection.pathParam("shotlistId"));
        UUID userId = UUID.fromString(connection.pathParam("userId"));

        websocketService.removeFromRoom(shotlistId, userId, connection.id());
    }

    @OnTextMessage
    public void onMessage(String messageJson) {
        UUID shotlistId = UUID.fromString(connection.pathParam("shotlistId"));
        UUID userId = UUID.fromString(connection.pathParam("userId"));

        websocketService.broadcast(shotlistId, userId, messageJson);
    }
}
