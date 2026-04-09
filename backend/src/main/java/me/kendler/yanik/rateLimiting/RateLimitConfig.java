package me.kendler.yanik.rateLimiting;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;
import java.util.Map;

//AI
@ConfigMapping(prefix = "shotly.rate-limit")
public interface RateLimitConfig {

    Map<String, BucketSettings> buckets();

    interface BucketSettings {
        @WithDefault("10")
        int capacity();

        @WithDefault("60")
        int seconds();
    }
}