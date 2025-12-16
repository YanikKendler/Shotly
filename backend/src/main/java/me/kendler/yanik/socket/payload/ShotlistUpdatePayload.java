package me.kendler.yanik.socket.payload;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "kind"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = ShotAttributePayload.class, name = "shotAttribute"),
        @JsonSubTypes.Type(value = UserPayload.class, name = "user"),
        @JsonSubTypes.Type(value = ShotPayload.class, name = "shot"),
})
public sealed interface ShotlistUpdatePayload permits
        ShotAttributePayload,
        UserPayload,
        ShotPayload
{ }
