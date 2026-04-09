package me.kendler.yanik.auth0;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface Auth0ManagementClient {
    @DELETE
    @Path("/api/v2/users/{id}")
    void deleteUserById(
            @HeaderParam("Authorization") String authorization,
            @PathParam("id") String userId
    );

    @POST
    @Path("/dbconnections/change_password")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    String triggerPasswordReset(PasswordResetRequest request);
}