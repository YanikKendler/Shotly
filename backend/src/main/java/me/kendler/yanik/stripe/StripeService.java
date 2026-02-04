package me.kendler.yanik.stripe;

import com.stripe.Stripe;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.param.PriceListParams;
import com.stripe.param.SubscriptionCancelParams;
import com.stripe.param.SubscriptionListParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import me.kendler.yanik.model.User;
import me.kendler.yanik.model.UserTier;
import me.kendler.yanik.repositories.UserRepository;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class StripeService {
    @Inject
    UserRepository userRepository;

    @ConfigProperty(name = "stripe.api-key")
    String apiKey;

    @ConfigProperty(name = "stripe.frontend-url")
    String frontendUrl;

    private static final Logger LOGGER = Logger.getLogger(StripeService.class);

    @PostConstruct
    void init() {
        Stripe.apiKey = apiKey;
    }

    public Session createCheckoutSession(String lookupKey, JsonWebToken jwt) {
        PriceCollection prices;

        try{
            prices = Price.list(PriceListParams.builder().addLookupKey(lookupKey).build());
        }catch (StripeException e){
            LOGGER.error("Error retrieving price for lookup key: " + lookupKey + ". Error: " + e.getMessage());
            throw new ShotlyException("Error retrieving price from Stripe.", ShotlyErrorCode.NOT_FOUND);
        }

        if (prices.getData().isEmpty()) {
            throw new ShotlyException("No price found for lookup key: " + lookupKey, ShotlyErrorCode.NOT_FOUND);
        }
        String priceId = prices.getData().get(0).getId();

        User user = userRepository.findOrCreateByJWT(jwt);

        // Check if the user already has an active subscription for this product
        if (user.stripeCustomerId != null && !user.stripeCustomerId.isEmpty()) {
            SubscriptionListParams listParams = SubscriptionListParams.builder()
                    .setCustomer(user.stripeCustomerId)
                    .setPrice(priceId)
                    .build();

            SubscriptionCollection subscriptions;

            try{
                subscriptions = Subscription.list(listParams);
            }catch (StripeException e){
                LOGGER.error("Error retrieving subscriptions for user " + user.name + " with Stripe Customer ID: " + user.stripeCustomerId + ". Error: " + e.getMessage());
                throw new ShotlyException("Error retrieving subscriptions from Stripe.", ShotlyErrorCode.NOT_FOUND);
            }

            for (Subscription sub : subscriptions.getData()) {
                // Check for active-like statuses
                if (sub.getStatus().equals("active") ||
                        sub.getStatus().equals("trialing") ||
                        sub.getStatus().equals("past_due")) {
                    LOGGER.warn("User " + user.name + " (Stripe Customer ID: " + user.stripeCustomerId + ") is already actively subscribed to price " + priceId);
                    throw new ShotlyException("User is already subscribed to this product.", ShotlyErrorCode.ALREADY_SUBSCRIBED);
                }
            }
        }

        //global metadata that's also available in the checkout (to link a new customer to a user)
        Map<String, String> sessionMetadata = new HashMap<>();
        sessionMetadata.put("userId", user.id.toString());

        SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPrice(priceId)
                        .setQuantity(1L)
                        .build())
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSubscriptionData(
                        SessionCreateParams.SubscriptionData.builder()
                                .putMetadata("userId", user.id.toString())
                                .build()
                )
                .setAllowPromotionCodes(true)
                .putAllMetadata(sessionMetadata)
                .setSuccessUrl(frontendUrl + "/dashboard?jbp=true")
                .setCancelUrl(frontendUrl + "/pro/canceled");

        // use existing customer if present, otherwise stripe will create a new one
        if (user.stripeCustomerId != null && !user.stripeCustomerId.isEmpty()) {
            sessionBuilder.setCustomer(user.stripeCustomerId);
        }

        Session session;

        try {
            session = Session.create(sessionBuilder.build());
        }catch (StripeException e){
            LOGGER.error("Error creating checkout session for user " + user.name + ". Error: " + e.getMessage());
            throw new ShotlyException("Error creating checkout session.", ShotlyErrorCode.CHECKOUT_FAILED);
        }

        return session;
    }

    public com.stripe.model.billingportal.Session createPortalSession(JsonWebToken jwt) {
        User user = userRepository.findOrCreateByJWT(jwt);

        //edge case where the DB lost the user's stripeCustomerId
        if(user.stripeCustomerId == null){
            LOGGER.warn("User " + user.name + " does not have a Stripe Customer ID when trying to create a portal session. But has sub tier: " + user.tier);
            throw new ShotlyException("User does not have a Stripe Customer ID.", ShotlyErrorCode.NO_STRIPE_CUSTOMER_ID);
        }

        com.stripe.model.billingportal.Session session;

        try {
            session = com.stripe.model.billingportal.Session.create(
                    com.stripe.param.billingportal.SessionCreateParams.builder()
                            .setCustomer(user.stripeCustomerId)
                            .setReturnUrl(frontendUrl + "/dashboard")
                            .build()
            );
        }
        catch (StripeException e){
            LOGGER.error("Error creating portal session for user " + user.name + ". Error: " + e.getMessage());
            throw new ShotlyException("Error creating portal session.", ShotlyErrorCode.CHECKOUT_FAILED);
        }

        return session;
    }

    public void cancelAllSubscriptions(User user) {
        if(user == null){
            throw new ShotlyException("User not found.", ShotlyErrorCode.NOT_FOUND);
        }

        if(user.stripeCustomerId == null || user.stripeCustomerId.isEmpty()){
            LOGGER.info("User " + user.name + " does not have a Stripe Customer ID. No subscriptions to cancel.");
            return;
        }

        SubscriptionListParams listParams = SubscriptionListParams.builder()
                .setCustomer(user.stripeCustomerId)
                .build();

        SubscriptionCollection subscriptions;

        try{
            subscriptions = Subscription.list(listParams);
        }catch (StripeException e){
            LOGGER.error("Error retrieving subscriptions for user " + user.name + " with Stripe Customer ID: " + user.stripeCustomerId + ". Error: " + e.getMessage());
            throw new ShotlyException("Error retrieving subscriptions from Stripe.", ShotlyErrorCode.NOT_FOUND);
        }

        SubscriptionCancelParams params = SubscriptionCancelParams.builder().build();

        for (Subscription sub : subscriptions.getData()) {
            try{
                sub.cancel(params);
            } catch (StripeException e){
                LOGGER.error("Error cancelling subscription " + sub.getId() + " for user " + user.name + ". Error: " + e.getMessage());
                throw new ShotlyException("Error cancelling subscription.", ShotlyErrorCode.CANCELLATION_FAILED);
            }
        }
    }

    @Transactional
    public boolean handleWebhook(Event event){
        EventDataObjectDeserializer eventDataObjectDeserializer = event.getDataObjectDeserializer();

        if (eventDataObjectDeserializer.getObject().isEmpty()) {
            LOGGER.warn("Webhook event data object is empty: " + event.toJson());
            return false;
        }

        Object obj = eventDataObjectDeserializer.getObject().get();

        switch (event.getType()) {
            case "checkout.session.completed":
                Session session = (Session) obj;
                String userIdFromSessionMetadata = session.getMetadata().get("userId");
                String stripeCustomerId = session.getCustomer();

                if (userIdFromSessionMetadata == null) {
                    LOGGER.error("No userId metadata found in checkout.session.completed event: " + event.toJson());
                    return false;
                }
                if (stripeCustomerId == null) {
                    LOGGER.error("No customer ID found in checkout.session.completed event: " + event.toJson());
                    return false;
                }

                User userToUpdate = userRepository.findById(UUID.fromString(userIdFromSessionMetadata));
                if (userToUpdate == null) {
                    LOGGER.error("User not found for userId from session metadata: " + userIdFromSessionMetadata);
                    return false;
                }

                if (userToUpdate.stripeCustomerId == null || userToUpdate.stripeCustomerId.isEmpty()) {
                    userToUpdate.stripeCustomerId = stripeCustomerId;
                    userRepository.persist(userToUpdate);
                    LOGGER.info("User " + userToUpdate.name + " updated with Stripe Customer ID: " + stripeCustomerId);
                } else {
                    LOGGER.info("User " + userToUpdate.name + " already has Stripe Customer ID: " + userToUpdate.stripeCustomerId);
                }
                break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                Subscription sub = (Subscription) obj;
                String userIdMetadata = sub.getMetadata().get("userId");

                if (userIdMetadata == null) {
                    LOGGER.error("No userId metadata found in subscription event: " + event.toJson());
                    return false;
                }

                User user = userRepository.findById(UUID.fromString(userIdMetadata));
                if (user == null) {
                    LOGGER.error("User not found for userId from subscription metadata: " + userIdMetadata);
                    return false;
                }

                LOGGER.info("Found user for subscription event: " + user.name);

                switch (event.getType()) {
                    case "customer.subscription.created":
                        LOGGER.info("Subscription created for user: " + user.name + ", ID: " + sub.getId());
                        user.tier = UserTier.PRO;
                        userRepository.persist(user);
                        break;
                    case "customer.subscription.updated":
                        LOGGER.info("Subscription updated for user: " + user.name + ", status: " + sub.getStatus());
                        if (sub.getCancelAtPeriodEnd()) {
                            LOGGER.info("User: " + user.name + " has cancelled his subscription.");
                            user.hasCancelled = true;
                        }
                        if(sub.getStatus().equals("active")) {
                            LOGGER.info("User: " + user.name + " remains as PRO.");
                            user.tier = UserTier.PRO;
                        } else if (sub.getStatus().equals("canceled") || sub.getStatus().equals("unpaid")) {
                            LOGGER.info("User: " + user.name + " subscription is no longer active. Downgrading to BASIC.");
                            user.tier = UserTier.BASIC;
                        }
                        userRepository.persist(user);
                        break;
                    case "customer.subscription.deleted":
                        LOGGER.info("Subscription deleted for user: " + user.name + ", ID: " + sub.getId());
                        user.tier = UserTier.BASIC;
                        userRepository.persist(user);
                        break;
                }
                break;

            default:
                LOGGER.info("Unhandled Stripe event type: " + event.getType());
                break;
        }

        return true;
    }
}
