package me.kendler.yanik.endpoints;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import me.kendler.yanik.rateLimiting.RateLimited;

/**
 * Purely for testing if the service is online
 */
@Path("/test")
@RateLimited()
public class TestResource {
    @GET
    public String hello() {
        return "Hello, World!";
    }
}
