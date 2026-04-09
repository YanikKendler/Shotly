package me.kendler.yanik.rateLimiting;

import io.github.bucket4j.Bucket;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.interceptor.*;
import me.kendler.yanik.error.ShotlyErrorCode;
import me.kendler.yanik.error.ShotlyException;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

//AI
@Interceptor
@RateLimited
@Priority(Interceptor.Priority.APPLICATION)
public class RateLimitInterceptor {

    @Inject JsonWebToken jwt;
    @Inject RateLimitConfig config;

    private final Map<String, Bucket> limiters = new ConcurrentHashMap<>();

    @AroundInvoke
    public Object intercept(InvocationContext context) throws Exception {
        RateLimited anno = context.getMethod().getAnnotation(RateLimited.class);
        String bucketName;
        if(anno != null)
            bucketName = anno.value();
        else
            bucketName = "default";

        // 2. Resolve identity
        String identity = jwt.getSubject() != null ? jwt.getSubject() : "anonymous";
        String key = identity + ":" + bucketName;

        // 3. Get or create the bucket based on CENTRAL config
        Bucket bucket = limiters.computeIfAbsent(key, k -> {
            var settings = config.buckets().getOrDefault(bucketName, config.buckets().get("default"));
            return Bucket.builder()
                    .addLimit(limit -> limit.capacity(settings.capacity())
                            .refillGreedy(settings.capacity(), Duration.ofSeconds(settings.seconds())))
                    .build();
        });

        if (bucket.tryConsume(1)) {
            return context.proceed();
        } else {
            throw new ShotlyException("Rate limit exceeded for " + bucketName, ShotlyErrorCode.TOO_MANY_REQUESTS);
        }
    }
}