package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import me.kendler.yanik.dto.user.UserBlockDTO;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.dto.user.UserEditDTO;
import me.kendler.yanik.model.User;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;

@GraphQLApi
@RateLimited()
public class UserResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    UserRepository userRepository;

    @Query
    public UserDTO getCurrentUser() {
        return userRepository.getCurrentUserDTO(jwt);
    }

    @Mutation
    public UserDTO updateUser(UserEditDTO editDTO) {
        return userRepository.update(editDTO, jwt);
    }

    @Mutation
    public UserDTO deleteUser() {
        return userRepository.delete(jwt);
    }

    @Mutation
    @RateLimited("strict")
    public String triggerPasswordReset() {
        return userRepository.triggerPasswordReset(jwt);
    }

    @Mutation
    public UserDTO setHowDidYourHearReason(String reason) {
        return userRepository.setHowDidYourHearReason(jwt, reason);
    }

    @Mutation
    public UserDTO updateUserBlocking(UserBlockDTO blockDTO) {
        return userRepository.updateUserBlocking(jwt, blockDTO);
    }
}