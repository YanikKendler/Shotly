package me.kendler.yanik.endpoints;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
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
import me.kendler.yanik.stripe.StripeCheckoutRequest;
import me.kendler.yanik.stripe.StripeService;
import me.kendler.yanik.stripe.StripeSessionResponse;
import org.eclipse.microprofile.config.inject.ConfigProperty;
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
    public StripeSessionResponse checkout(StripeCheckoutRequest req) throws StripeException {
        Session session = stripeService.createCheckoutSession(req.lookupKey(), jwt);
        return new StripeSessionResponse(session.getUrl());
    }

    @GET
    @Path("/create-portal-session")
    public StripeSessionResponse portal() throws StripeException {
        com.stripe.model.billingportal.Session portal = stripeService.createPortalSession(jwt);
        return new StripeSessionResponse(portal.getUrl());
    }

    @POST
    @Path("/webhook")
    @Consumes(MediaType.APPLICATION_JSON)
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
