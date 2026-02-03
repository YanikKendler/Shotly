package me.kendler.yanik.endpoints;

import io.quarkus.panache.common.Sort;
import jakarta.inject.Inject;
import me.kendler.yanik.dto.user.UserAdminUpdateDTO;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.dto.user.UserEditDTO;
import me.kendler.yanik.model.User;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

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

    /*@Mutation
    public User setAllowAnalytics(boolean allow){
        return userRepository.setAllowAnalytics(jwt, allow);
    }*/

    // ADMIN

    @Query
    public List<UserDTO> getUsers(){
        userRepository.checkAdmin(jwt);

        List<User> users = userRepository.findAll(Sort.descending("name")).stream().toList();

        return users.stream().map(User::toDTO).toList();
    }

    @Mutation
    public UserDTO adminUpdateUser(UserAdminUpdateDTO updateDTO){
        userRepository.checkAdmin(jwt);

        return userRepository.adminUserUpdate(updateDTO);
    }
}
