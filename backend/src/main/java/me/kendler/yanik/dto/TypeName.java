package me.kendler.yanik.dto;

/**
 * This is used to parse anything with inheritance in the frontend, graphql automatically inserts __typename
 * but that sadly breaks when using sockets. Because im using records and java doesnt allow inheritance with records
 * it forces this workaround of implementing the same exact method everywhere.
 */
public interface TypeName {
    String getType();
}
