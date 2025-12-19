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
        @JsonSubTypes.Type(value = CollaborationPayload.class, name = "collaboration"),
        @JsonSubTypes.Type(value = PresentCollaboratorsPayload.class, name = "presentCollaborators"),
        @JsonSubTypes.Type(value = ScenePayload.class, name = "scene"),
        @JsonSubTypes.Type(value = SceneAttributePayload.class, name = "sceneAttribute"),
        @JsonSubTypes.Type(value = SceneSelectOptionPayload.class, name = "sceneAttributeOption"),
        @JsonSubTypes.Type(value = ShotSelectOptionPayload.class, name = "shotAttributeOption"),
        @JsonSubTypes.Type(value = EmptyPayload.class, name = "empty"),
})
public sealed interface ShotlistUpdatePayload permits
        UserPayload,
        PresentCollaboratorsPayload,
        CollaborationPayload,
        ShotAttributePayload,
        ShotPayload,
        ScenePayload,
        SceneAttributePayload,
        SceneSelectOptionPayload,
        ShotSelectOptionPayload,
        EmptyPayload
{ }
