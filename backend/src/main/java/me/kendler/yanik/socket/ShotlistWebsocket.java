package me.kendler.yanik.socket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;
import me.kendler.yanik.stripe.StripeService;
import org.jboss.logging.Logger;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/*
 * about web sockets..
 * so i just spent like 2 hours trying to figure out how to implement websocket rooms in a clean way
 * i created and scrapped 3 classes until i gave up.. i guess something that was easy in the old quarkus websocket api
 * is now only possible with this ugly workaround of storing connection ids because there apparently is no way to just
 * store a singular immutable reference to a connection anymore instead there is this new system of injecting a WebSocketConnection
 * that represents the current connection.. which then obviously changes with each client so there is no way of storing that
 * i dont understand the benefits of packing the other connections this way and why there is no native support for rooms
 */

/**
 * TODO
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
        websocketService.sendPresentUsers(shotlistId, connection);
    }

    @OnClose
    public void onClose() {
        UUID shotlistId = UUID.fromString(connection.pathParam("shotlistId"));
        UUID userId = UUID.fromString(connection.pathParam("userId"));

        websocketService.removeFromRoom(shotlistId, userId, connection.id());
    }
}
