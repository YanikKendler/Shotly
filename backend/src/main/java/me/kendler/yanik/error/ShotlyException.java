package me.kendler.yanik.error;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import java.util.List;
import java.util.Map;

public class ShotlyException extends RuntimeException implements GraphQLError {

    private final ShotlyErrorCode code;

    public ShotlyException(String message, ShotlyErrorCode code) {
        super(message);
        this.code = code;
    }

    @Override
    public Map<String, Object> getExtensions() {
        // This puts the exact Enum string (e.g., "READ_ONLY_ACCESS")
        // into the "extensions" part of the GraphQL error JSON.
        return Map.of("code", code.name(), "type", "SHOTLY_EXCEPTION");
    }

    @Override
    public List<SourceLocation> getLocations() {
        return null; // returning null is standard for business logic errors
    }

    @Override
    public ErrorClassification getErrorType() {
        // DataFetchingException is the standard type for runtime errors in resolvers
        return ErrorType.DataFetchingException;
    }
}