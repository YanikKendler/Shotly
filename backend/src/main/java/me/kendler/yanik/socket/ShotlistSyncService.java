package me.kendler.yanik.socket;

import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.model.User;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.socket.payload.PresentCollaboratorsPayload;
import me.kendler.yanik.socket.payload.UserPayload;
import org.jboss.logging.Logger;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@ApplicationScoped
public class ShotlistSyncService {

    @Inject
    UserRepository userRepository;

    private static final Logger LOGGER = Logger.getLogger(ShotlistSyncService.class);

    //one room per shotlist
    private final Map<UUID, BroadcastProcessor<ShotlistUpdateDTO>> rooms = new ConcurrentHashMap<>();

    // Tracks which users are in which room for the "Present Collaborators" payload
    private final Map<UUID, Set<PresentCollaborator>> roomUsers = new ConcurrentHashMap<>();

    private BroadcastProcessor<ShotlistUpdateDTO> getRoom(UUID shotlistId) {
        return rooms.computeIfAbsent(shotlistId, id -> BroadcastProcessor.create());
    }

    /**
     * Allows a user to subscribe to a shotlist (room) and returns the stream
     */
    public Multi<ShotlistUpdateDTO> subscribe(UUID shotlistId, UUID userId) {
        BroadcastProcessor<ShotlistUpdateDTO> roomStream = getRoom(shotlistId);

        Multi<ShotlistUpdateDTO> initialData = Multi.createFrom()
                .item(() -> getPresentCollaborators(shotlistId, userId))
                .runSubscriptionOn(Infrastructure.getDefaultWorkerPool());

        Multi<ShotlistUpdateDTO> liveUpdates = roomStream
                .filter(update -> !update.userId().equals(userId));

        return Multi.createBy().concatenating().streams(initialData, liveUpdates)
                .emitOn(Infrastructure.getDefaultWorkerPool())
                .broadcast().toAllSubscribers()
                .onSubscription().call(ignored ->
                        Uni.createFrom().voidItem()
                                .invoke(() -> handleJoin(shotlistId, userId))
                                .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
                )
                .onTermination().call(() ->
                        Uni.createFrom().voidItem()
                                .invoke(() -> handleLeave(shotlistId, userId))
                                .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
                );
    }

    /**
     * Broadcasts an update to all users viewing the same shotlist id
     */
    public void broadcast(UUID shotlistId, ShotlistUpdateDTO update) {
        try {
            getRoom(shotlistId).onNext(update);
        } catch (Exception e) {
            LOGGER.warnf("Could not broadcast to shotlist %s: %s", shotlistId, e.getMessage());
        }
    }

    public void updateCollaboratorScene(UUID shotlistId, UUID userId, UUID newSceneId) {
        Set<PresentCollaborator> collaborators = roomUsers.get(shotlistId);

        if (collaborators != null) {
            collaborators.stream()
                    .filter(c -> c.user.id().equals(userId))
                    .findFirst()
                    .ifPresent(collaborator -> collaborator.selectedSceneId = newSceneId);
        }
    }

    @Transactional
    protected void handleJoin(UUID shotlistId, UUID userId) {
        User user = userRepository.findById(userId);

        if (user != null) {
            PresentCollaborator collaborator = new PresentCollaborator(user.toMinimalDTO());
            roomUsers.computeIfAbsent(shotlistId, k -> ConcurrentHashMap.newKeySet()).add(collaborator);

            broadcast(shotlistId, new ShotlistUpdateDTO(ShotlistUpdateType.USER_JOINED, userId, new UserPayload(collaborator)));
        }
    }

    @Transactional
    protected void handleLeave(UUID shotlistId, UUID userId) {
        Set<PresentCollaborator> users = roomUsers.get(shotlistId);

        PresentCollaborator collaborator = users.stream().filter(c -> c.user.id().equals(userId)).findFirst().orElse(null);
        users.remove(collaborator);

        roomUsers.put(shotlistId, users);

        broadcast(shotlistId, new ShotlistUpdateDTO(ShotlistUpdateType.USER_LEFT, userId, new UserPayload(collaborator)));
    }

    @Transactional
    protected ShotlistUpdateDTO getPresentCollaborators(UUID shotlistId, UUID userId) {
        Set<PresentCollaborator> presentCollaborators = roomUsers.getOrDefault(shotlistId, Collections.emptySet());

        Set<PresentCollaborator> filteredCollaborators = presentCollaborators.stream().filter(u -> !u.user.id().equals(userId)).collect(Collectors.toSet());

        return new ShotlistUpdateDTO(
                ShotlistUpdateType.PRESENT_COLLABORATORS,
                shotlistId,
                new PresentCollaboratorsPayload(filteredCollaborators.stream().toList())
        );
    }
}