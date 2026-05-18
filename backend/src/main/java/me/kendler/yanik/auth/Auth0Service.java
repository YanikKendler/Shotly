package me.kendler.yanik.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

@ApplicationScoped
public class Auth0Service {
    @ConfigProperty(name = "auth0.client-id")
    String clientId;

    @ConfigProperty(name = "auth0.client-secret")
    String clientSecret;

    @ConfigProperty(name = "auth0.audience")
    String audience;

    @Inject
    @RestClient
    Auth0ManagementClient auth0Client;

    @Inject
    @RestClient
    Auth0TokenClient auth0TokenClient;

    private static final Logger LOGGER = Logger.getLogger(Auth0Service.class);

    public void deleteUser(String userId) {
        String token = getManagementToken();
        auth0Client.deleteUserById("Bearer " + token, userId);
    }

    public String triggerPasswordReset(String email) {
        LOGGER.infof("Password reset triggered for email %s", email);
        return auth0Client.triggerPasswordReset(
                new PasswordResetRequest(clientId, email, "Username-Password-Authentication")
        );
    }

    private String getManagementToken() {
        Auth0TokenResponse response = auth0TokenClient.getToken(clientId,clientSecret,audience,"client_credentials");
        return response.access_token();
    }
}
