package me.kendler.yanik.socket;

import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;
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
import java.util.stream.Collectors;

@ApplicationScoped
public class ShotlistSyncService {

    @Inject
    UserRepository userRepository;

    private static final Logger LOGGER = Logger.getLogger(ShotlistSyncService.class);

    //one room per shotlist
    private final Map<UUID, BroadcastProcessor<ShotlistUpdateDTO>> rooms = new ConcurrentHashMap<>();

    // Tracks which users are in which room for the "Present Collaborators" payload
    private final Map<UUID, Set<UUID>> roomUsers = new ConcurrentHashMap<>();

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

    @Transactional
    protected void handleJoin(UUID shotlistId, UUID userId) {
        roomUsers.computeIfAbsent(shotlistId, k -> ConcurrentHashMap.newKeySet()).add(userId);
        User user = userRepository.findById(userId);

        if (user != null) {
            broadcast(shotlistId, new ShotlistUpdateDTO(ShotlistUpdateType.USER_JOINED, userId, new UserPayload(user.toMinimalDTO())));
        }
    }

    @Transactional
    protected void handleLeave(UUID shotlistId, UUID userId) {
        Set<UUID> users = roomUsers.get(shotlistId);
        if (users != null) users.remove(userId);

        User user = userRepository.findById(userId);
        if (user != null) {
            broadcast(shotlistId, new ShotlistUpdateDTO(ShotlistUpdateType.USER_LEFT, userId, new UserPayload(user.toMinimalDTO())));
        }
    }

    @Transactional
    protected ShotlistUpdateDTO getPresentCollaborators(UUID shotlistId, UUID userId) {
        Set<UUID> presentUserIds = roomUsers.getOrDefault(shotlistId, Collections.emptySet());

        Set<UUID> filteredUserIds = presentUserIds.stream().filter(u -> !u.equals(userId)).collect(Collectors.toSet());

        List<UserMinimalDTO> presentUsers = userRepository.find("id IN ?1", filteredUserIds).list()
                .stream()
                .map(User::toMinimalDTO)
                .toList();

        return new ShotlistUpdateDTO(
                ShotlistUpdateType.PRESENT_COLLABORATORS,
                shotlistId,
                new PresentCollaboratorsPayload(presentUsers)
        );
    }
}