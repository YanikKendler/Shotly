package me.kendler.yanik.endpoints;

import jakarta.inject.Inject;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.dto.user.UserEditDTO;
import me.kendler.yanik.model.User;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;

@GraphQLApi
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
    public User updateUser(UserEditDTO editDTO) {
        return userRepository.update(editDTO, jwt);
    }

    @Mutation
    public User deleteUser() {
        return userRepository.delete(jwt);
    }

    @Mutation
    public String triggerPasswordReset() {
        return userRepository.triggerPasswordReset(jwt);
    }

    @Mutation
    public User setHowDidYourHearReason(String reason) {
        return userRepository.setHowDidYourHearReason(jwt, reason);
    }

    @Mutation
    public User setAllowAnalytics(boolean allow){
        return userRepository.setAllowAnalytics(jwt, allow);
    }
}
