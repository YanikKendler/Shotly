package me.kendler.yanik.auth;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(baseUri = "https://dev-pvlm4i5qpteni14h.us.auth0.com")
@Path("/oauth/token")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
@Produces(MediaType.APPLICATION_JSON)
public interface Auth0TokenClient {

    @POST
    Auth0TokenResponse getToken(
            @FormParam("client_id") String clientId,
            @FormParam("client_secret") String clientSecret,
            @FormParam("audience") String audience,
            @FormParam("grant_type") String grantType
    );
}
