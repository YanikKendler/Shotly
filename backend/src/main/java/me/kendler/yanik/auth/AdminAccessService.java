package me.kendler.yanik.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.json.JsonArray;
import jakarta.json.JsonString;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import org.eclipse.microprofile.jwt.JsonWebToken;

@ApplicationScoped
public class AdminAccessService {
    private boolean isAdmin(JsonWebToken jwt) {
        Object rolesClaim = jwt.getClaim("https://shotly.at/roles");

        if (rolesClaim instanceof JsonArray jsonArray) {
            return jsonArray.getValuesAs(JsonString.class)
                    .stream()
                    .anyMatch(js -> js.getString().equalsIgnoreCase("Admin"));
        }

        return false;
    }

    public void check(JsonWebToken jwt) {
        if (!isAdmin(jwt)) {
            throw new ShotlyException("You are not allowed to access this resource", ShotlyErrorCode.NOT_ALLOWED);
        }
    }
}
