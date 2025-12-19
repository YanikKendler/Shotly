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

    @Transactional
    public void addToRoom(UUID shotlistId, UUID userId, String connectionId) {
        rooms.computeIfAbsent(shotlistId, k -> ConcurrentHashMap.newKeySet())
                .add(connectionId);

        User user = userRepository.findById(userId);

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

        List<String> presentUserIds = connections
                .listAll()
                .stream()
                .map(conn -> conn.pathParam("userId"))
                .toList();

        //without the current user
        List<String> filteredUserIds = presentUserIds.stream().filter(id -> !id.equals(connection.pathParam("userId"))).toList();

        List<UserMinimalDTO> presentUsers = userRepository.find("id IN ?1", filteredUserIds).list()
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

            connection.sendTextAndAwait(json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
