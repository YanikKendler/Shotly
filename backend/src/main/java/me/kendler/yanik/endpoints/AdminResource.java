package me.kendler.yanik.endpoints;

import io.quarkus.panache.common.Sort;
import jakarta.inject.Inject;
import me.kendler.yanik.auth.AdminAccessService;
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

    @Inject
    AdminAccessService accessService;

    @Query
    public List<UserDTO> getUsers(){
        accessService.check(jwt);

        List<User> users = userRepository.findAll(Sort.descending("name")).stream().toList();

        return users.stream().map(User::toDTO).toList();
    }

    @Mutation
    public UserDTO adminUpdateUser(UserAdminUpdateDTO updateDTO){
        accessService.check(jwt);

        return userRepository.adminUserUpdate(updateDTO);
    }

    @Query
    public StatCounts getRecentActiveUserStats(){
        accessService.check(jwt);

        return userRepository.calculateRecentActiveUserStats();
    }

    @Query
    public StatCounts getRecentCreatedUserStats(){
        accessService.check(jwt);

        return userRepository.calculateRecentCreatedUserStats();
    }

    @Query
    public StatCounts getRecentCreatedShotlistStats(){
        accessService.check(jwt);

        return shotlistRepository.calculateRecentCreatedShotlistStats();
    }
}
