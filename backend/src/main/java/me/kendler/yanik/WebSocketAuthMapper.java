package me.kendler.yanik;

import io.quarkus.vertx.web.RouteFilter;
import io.vertx.ext.web.RoutingContext;
import jakarta.enterprise.context.ApplicationScoped;


/**
 * Maps the access token retrieved from the url param "access_token" to the auth header
 * which enables the standard flow to take over and expose it as the injectable JWT
 *
 * AI generated
 */
@ApplicationScoped
public class WebSocketAuthMapper {
    @RouteFilter(500)
    public void filter(RoutingContext ctx) {
        String token = ctx.request().getParam("access_token");
        if (token != null && ctx.request().getHeader("Authorization") == null) {
            ctx.request().headers().add("Authorization", "Bearer " + token);
        }
        ctx.next();
    }
}
