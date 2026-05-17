package me.kendler.yanik.socket;

import io.smallrye.graphql.api.Subscription;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.inject.Inject;
import jakarta.ws.rs.QueryParam;
import me.kendler.yanik.model.User;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.socket.payload.EmptyPayload;
import me.kendler.yanik.socket.payload.SelectedCellPayload;
import me.kendler.yanik.socket.payload.SelectedSceneAttributePayload;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.UUID;

@GraphQLApi
public class ShotlistSyncResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    ShotlistSyncService syncService;

    @Inject
    UserRepository userRepository;

    @Subscription
    public Multi<ShotlistUpdateDTO> shotlistUpdates(UUID shotlistId, UUID userId) {

        return Uni.createFrom().item(() -> {
                userRepository.checkShotlistViewRights(shotlistId, jwt);
                return true;
            })
            .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
            .onItem().transformToMulti(ignored -> syncService.subscribe(shotlistId, userId));
    }

    @Mutation
    public boolean syncShotlistOptionsUpdated(UUID shotlistId) {
        User user = userRepository.findOrCreateByJWT(jwt);

        userRepository.checkShotlistEditRights(shotlistId, jwt);

        syncService.broadcast(
            shotlistId,
            new ShotlistUpdateDTO(
                ShotlistUpdateType.SHOTLIST_OPTIONS_UPDATED,
                user.id,
                new EmptyPayload()
            )
        );

        return true;
    }

    @Mutation
    public boolean syncShotlistCellSelected(UUID shotlistId, SelectedCellPayload payload) {
        User user = userRepository.findOrCreateByJWT(jwt);

        userRepository.checkShotlistEditRights(shotlistId, jwt);

        syncService.broadcast(
            shotlistId,
            new ShotlistUpdateDTO(
                    ShotlistUpdateType.COLLABORATOR_CELL_SELECTED,
                    user.id,
                    payload
            )
        );

        return true;
    }

    @Mutation
    public boolean syncShotlistSceneAttributeSelected(UUID shotlistId, SelectedSceneAttributePayload payload) {
        User user = userRepository.findOrCreateByJWT(jwt);

        userRepository.checkShotlistEditRights(shotlistId, jwt);

        syncService.broadcast(
            shotlistId,
            new ShotlistUpdateDTO(
                    ShotlistUpdateType.COLLABORATOR_SCENE_ATTRIBUTE_SELECTED,
                    user.id,
                    payload
            )
        );

        return true;
    }
}
