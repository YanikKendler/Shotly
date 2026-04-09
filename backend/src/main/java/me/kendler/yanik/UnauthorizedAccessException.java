package me.kendler.yanik;

import io.smallrye.graphql.api.ErrorCode;

@ErrorCode("UNAUTHORIZED")
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }

    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
}