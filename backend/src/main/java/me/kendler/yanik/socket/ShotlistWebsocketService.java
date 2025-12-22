package me.kendler.yanik.socket;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.websockets.next.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.dto.user.UserMinimalDTO;
import me.kendler.yanik.model.User;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.socket.payload.PresentCollaboratorsPayload;
import me.kendler.yanik.socket.payload.UserPayload;
import org.jboss.logging.Logger;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages the room for the websocket connections and broadcasts updates to all connections in the room
 */
@ApplicationScoped
public class ShotlistWebsocketService {

    @Inject
    ObjectMapper objectMapper;

    @Inject
    OpenConnections connections;

    @Inject
    UserRepository userRepository;

    private static final Logger LOGGER = Logger.getLogger(ShotlistWebsocketService.class);

    // One room per shotlist - multiple connections in one room
    // Maps a shotlistId to a list of active connections (connection ids) for that shotlist
    // When a shotlist is updated, we can use this to broadcast the update to all users currently viewing the shotlist
    private final Map<UUID, Set<String>> rooms = new ConcurrentHashMap<>();

    /**
     * Each shotlist has its own room so that updates are only broadcasted to users viewing that shotlist
     */
    @Transactional
    public void addToRoom(UUID shotlistId, UUID userId, String connectionId) {
        rooms.computeIfAbsent(shotlistId, k -> ConcurrentHashMap.newKeySet())
                .add(connectionId);

        User user = userRepository.findById(userId);

        //broadcast join to all other users so that they can update their UI
        broadcast(
                shotlistId,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.USER_JOINED,
                        userId,
                        new UserPayload(user.toMinimalDTO())
                )
        );
    }

    @Transactional
    public void removeFromRoom(UUID shotlistId, UUID userId, String connectionId) {
        rooms.get(shotlistId).remove(connectionId);

        User user = userRepository.findById(userId);

        //broadcast leave to all other users so that they can update their UI
        broadcast(
                shotlistId,
                new ShotlistUpdateDTO(
                        ShotlistUpdateType.USER_LEFT,
                        userId,
                        new UserPayload(user.toMinimalDTO())
                )
        );
    }

    public void broadcast(UUID shotlistId, ShotlistUpdateDTO update) {
        try {
            String json = objectMapper.writeValueAsString(update);

            broadcast(shotlistId, update.userId(), json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Broadcasts a message to all connections in the room except the sender
     * used for all interactions with the data in the shotlist
     * is called from graphql mutation endpoints
     */
    @Transactional
    public void broadcast(UUID shotlistId, UUID userId, String json){
        Set<String> room = rooms.get(shotlistId);
        if (room == null) return;

        try {
            for (WebSocketConnection conn : connections.listAll()) {
                if (!room.contains(conn.id())) continue;
                if (userId.equals(UUID.fromString(conn.pathParam("userId")))) continue;

                System.out.println("sending to connection with userId " + conn.pathParam("userId"));

                conn.sendTextAndAwait(json);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void sendPresentCollaborators(UUID shotlistId, WebSocketConnection connection) {
        Set<String> room = rooms.get(shotlistId);
        if (room == null) return;

        //all users that are currently in this room (viewing the same shotlist)
        List<String> presentUserIds = connections
                .listAll()
                .stream()
                .filter(conn -> {
                    //connection is not to the current room
                    if(!room.contains(conn.id()))
                        return false;
                    //connection is the current connection
                    if(conn.id().equals(connection.id()) || conn.pathParam("userId").equals(connection.pathParam("userId")))
                        return false;
                    return true;
                })
                .map(conn -> conn.pathParam("userId"))
                .toList();

        //as userMinimalDTOs
        List<UserMinimalDTO> presentUsers = userRepository.find("id IN ?1", presentUserIds).list()
                .stream()
                .map(User::toMinimalDTO)
                .toList();

        try {
            String json = objectMapper.writeValueAsString(new ShotlistUpdateDTO(
                    ShotlistUpdateType.PRESENT_COLLABORATORS,
                    shotlistId,
                    new PresentCollaboratorsPayload(
                        presentUsers
                    )
                )
            );

            //is sent to the connection that was passed along (the newly connected user)
            connection.sendTextAndAwait(json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
