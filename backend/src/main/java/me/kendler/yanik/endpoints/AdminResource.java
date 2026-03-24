package me.kendler.yanik.endpoints;

import io.quarkus.panache.common.Sort;
import jakarta.inject.Inject;
import me.kendler.yanik.dto.StatCounts;
import me.kendler.yanik.dto.user.UserAdminUpdateDTO;
import me.kendler.yanik.dto.user.UserDTO;
import me.kendler.yanik.model.User;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.ShotlistRepository;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@GraphQLApi
@RateLimited()
public class AdminResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    UserRepository userRepository;

    @Inject
    ShotlistRepository shotlistRepository;

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

    @Query
    public StatCounts getRecentActiveUserStats(){
        userRepository.checkAdmin(jwt);

        return userRepository.calculateRecentActiveUserStats();
    }

    @Query
    public StatCounts getRecentCreatedUserStats(){
        userRepository.checkAdmin(jwt);

        return userRepository.calculateRecentCreatedUserStats();
    }

    @Query
    public StatCounts getRecentCreatedShotlistStats(){
        userRepository.checkAdmin(jwt);

        return shotlistRepository.calculateRecentCreatedShotlistStats();
    }
}
