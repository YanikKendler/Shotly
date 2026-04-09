package me.kendler.yanik.socket.payload;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * The payload of the ShotlistUpdateDTO that is sent on every update to the shotlist
 * The payload contains the actual data that was changed (and additional stuff for properly updating the client state)
 *
 * The kind property is used to determine kind of payload in the frontend to make serialisation easier
 */
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
        @JsonSubTypes.Type(value = SelectedCellPayload.class, name = "selectedCell"),
        @JsonSubTypes.Type(value = SelectSceneAttributePayload.class, name = "selectedSceneAttribute"),
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
        SelectedCellPayload,
        SelectSceneAttributePayload,
        EmptyPayload
{ }
