package me.kendler.yanik.socket;

/**
 * Determines the actual type of change that happened
 * Multiple updateTypes can have the same payload
 * because different things are being updated
 */
public enum ShotlistUpdateType {
    USER_JOINED,
    USER_LEFT,
    COLLABORATION_TYPE_UPDATED,
    COLLABORATION_DELETED,
    PRESENT_COLLABORATORS,
    SHOT_ATTRIBUTE_UPDATED,
    SHOT_ADDED,
    SHOT_UPDATED,
    SHOT_DELETED,
    SCENE_ATTRIBUTE_UPDATED,
    SCENE_ADDED,
    SCENE_UPDATED,
    SCENE_DELETED,
    SCENE_SELECT_OPTION_CREATED,
    SHOT_SELECT_OPTION_CREATED,
    SHOTLIST_OPTIONS_UPDATED,
    COLLABORATOR_CELL_SELECTED,
    COLLABORATOR_SCENE_SELECTED,
    COLLABORATOR_SCENE_ATTRIBUTE_SELECTED,
    SHOTLIST_UPDATED,
    SHOTLIST_DELETED,
    COMMENT_ADDED,
    COMMENT_ARCHIVAL, //using two distinct types here to avoid having to figure out if archival has changed in frontend
    COMMENT_TEXT,
}