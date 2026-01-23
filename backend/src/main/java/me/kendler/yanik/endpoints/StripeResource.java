package me.kendler.yanik.endpoints;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import jakarta.persistence.OptimisticLockException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.core.HttpHeaders;
import com.stripe.net.Webhook;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.stripe.StripeCheckoutRequest;
import me.kendler.yanik.stripe.StripeService;
import me.kendler.yanik.stripe.StripeSessionResponse;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/stripe")
public class StripeResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    StripeService stripeService;

    @ConfigProperty(name = "stripe.webhook-secret")
    String webhookSecret;

    @POST
    @Path("/create-checkout-session")
    @Consumes("application/json")
    public Response checkout(StripeCheckoutRequest req) {
        Session session;

        try{
            session = stripeService.createCheckoutSession(req.lookupKey(), jwt);
            return Response.ok(new StripeSessionResponse(session.getUrl())).build();
        } catch (ShotlyException e) {
            return Response.serverError().build();
        }
    }

    @GET
    @Path("/create-portal-session")
    public Response portal() {
        com.stripe.model.billingportal.Session portal;
        try {
            portal = stripeService.createPortalSession(jwt);
            return Response.ok(new StripeSessionResponse(portal.getUrl())).build();
        }
        catch (ShotlyException e){
            return Response.serverError().build();
        }
    }

    @POST
    @Path("/webhook")
    @Consumes(MediaType.APPLICATION_JSON)
    @Retry(
            retryOn = OptimisticLockException.class,
            maxRetries = 3,
            delay = 200
    )
    public Response webhook(@Context HttpHeaders headers, String payload) {
        String signature = headers.getHeaderString("Stripe-Signature");

        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (Exception e) {
            return Response.status(400).build();
        }

        if(!stripeService.handleWebhook(event)) {
            return Response.status(400).build();
        }

        return Response.ok().build();
    }
}
