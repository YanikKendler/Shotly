import {AnyShotAttribute, SelectOption} from "@/util/Types"
import {SheetManagerRef} from "@/components/shotlist/spreadsheet/sheetManager/sheetManager"
import {
    CollaborationDto, CollaborationType, SceneAttributeBase, SceneAttributeBaseDto, SceneDto,
    SceneSelectAttributeOptionDefinition,
    ShotDto,
    ShotMultiSelectAttributeDto, ShotSelectAttributeOptionDefinition,
    ShotSingleSelectAttributeDto,
    ShotTextAttributeDto, UserTier
} from "../../lib/graphql/generated"
import {SceneAttributeParser, ShotAttributeParser} from "@/util/AttributeParser"
import {ShotlistSidebarRef} from "@/components/shotlist/shotlistSidebar/shotlistSidebar"
import {ShotlistContextProps} from "@/context/ShotlistContext"

export enum ShotlistUpdateType {
    USER_JOINED = "USER_JOINED",
    USER_LEFT = "USER_LEFT",
    SHOT_ATTRIBUTE_UPDATED = "SHOT_ATTRIBUTE_UPDATED",
    SHOT_ADDED = "SHOT_ADDED",
    SHOT_UPDATED = "SHOT_UPDATED",
    SHOT_DELETED = "SHOT_DELETED",
    SCENE_ADDED = "SCENE_ADDED",
    SCENE_UPDATED = "SCENE_UPDATED",
    SCENE_DELETED = "SCENE_DELETED",
    SCENE_ATTRIBUTE_UPDATED = "SCENE_ATTRIBUTE_UPDATED",
    SCENE_SELECT_OPTION_CREATED = "SCENE_SELECT_OPTION_CREATED",
    SHOT_SELECT_OPTION_CREATED = "SHOT_SELECT_OPTION_CREATED",
    SHOTLIST_OPTIONS_UPDATED = "SHOTLIST_OPTIONS_UPDATED"
}

/**
 * Object that gets broadcasted to the websocket when a collaborator makes an update to the shotlist
 */
export interface ShotlistUpdateDTO {
    type: ShotlistUpdateType,
    userId: string,
    timestamp: Date,
    payload: ShotlistUpdatePayload
}

/* Payloads */
export interface UserPayload {
    kind: "user"
    user: UserMinimalDTO
}

export interface ShotAttributePayload {
    kind: "shotAttribute"
    attribute: AnyShotAttribute
}

export interface ShotPayload {
    kind: "shot"
    shot: ShotDto
}

export interface CollaborationPayload {
    kind: "collaboration"
    userId: string
    type: CollaborationType
}

export interface PresentCollaboratorsPayload {
    kind: "presentCollaborators"
    collaborators: UserMinimalDTO[]
}

export interface ScenePayload {
    kind: "scene"
    scene: SceneDto
}

export interface SceneAttributePayload {
    kind: "sceneAttribute"
    attribute: SceneAttributeBaseDto
}

export interface SceneAttributeOptionPayload {
    kind: "sceneAttributeOption"
    optionDefinition: SceneSelectAttributeOptionDefinition
}

export interface ShotAttributeOptionPayload {
    kind: "shotAttributeOption"
    optionDefinition: ShotSelectAttributeOptionDefinition
}

export type ShotlistUpdatePayload = UserPayload | ShotAttributePayload | ShotPayload | CollaborationPayload | PresentCollaboratorsPayload | ScenePayload | SceneAttributePayload | SceneAttributeOptionPayload | ShotAttributeOptionPayload

/* other stuff */

export interface UserMinimalDTO {
    id: string,
    email: string,
    auth0Sub: string,
    name: string,
    tier: UserTier,
    createdAt: Date
}

export class ShotlistSyncService {
    shotlistId: string
    isReadOnly: boolean = false

    constructor(shotlistId: string) {
        this.shotlistId = shotlistId
    }

    updateShotAttribute(payload: ShotAttributePayload, sheetManager: SheetManagerRef | null){
        const sheetCellRef = sheetManager?.findCellRef(payload.attribute.id)

        if(this.isReadOnly){
            sheetCellRef?.setReadOnlyValue(ShotAttributeParser.toValueString(payload.attribute))
        }
        else {
            sheetCellRef?.setValue(ShotAttributeParser.toMultiTypeValue(payload.attribute))
        }
    }

    createShot(payload: ShotPayload, sheetManager: SheetManagerRef | null){
        if(!payload.shot || !payload.shot.id || !sheetManager) return

        sheetManager.onCreateShot(payload.shot)
    }

    updateShot(payload: ShotPayload, sheetManager: SheetManagerRef | null){
        if(!payload.shot || !payload.shot.id || !sheetManager) return

        sheetManager.onMoveShot(payload.shot.id, payload.shot.position)
    }

    deleteShot(payload: ShotPayload, sheetManager: SheetManagerRef | null){
        if(!payload.shot || !payload.shot.id || !sheetManager) return

        sheetManager.onDeleteShot(payload.shot.id)
    }

    updateSceneAttribute(payload: SceneAttributePayload, sidebar: ShotlistSidebarRef | null){
        const attributeRef = sidebar?.findAttribute(payload.attribute.id)

        if(this.isReadOnly){
            attributeRef?.setReadOnlyValue(SceneAttributeParser.toValueString(payload.attribute))
        }
        else {
            attributeRef?.setValue(SceneAttributeParser.toMultiTypeValue(payload.attribute))
        }
    }

    createScene(payload: ScenePayload, sidebar: ShotlistSidebarRef | null){
        if(!payload.scene || !payload.scene.id || !sidebar) return

        sidebar.onCreateScene(payload.scene)
    }

    updateScene(payload: ScenePayload, sidebar: ShotlistSidebarRef | null){
        if(!payload.scene || !payload.scene.id || !sidebar) return

        sidebar.onMoveScene(payload.scene.id, payload.scene.position)
    }

    deleteScene(payload: ScenePayload, sidebar: ShotlistSidebarRef | null){
        if(!payload.scene || !payload.scene.id || !sidebar) return

        sidebar.onDeleteScene(payload.scene.id)
    }

    shotAttributeOptionCreated(payload: ShotAttributeOptionPayload, addShotSelectOption: Function){
        addShotSelectOption(
            payload.optionDefinition.shotAttributeDefinition?.id,
            {
                label: payload.optionDefinition.name || "Unnamed",
                value: payload.optionDefinition.id
            }
        )
    }

    sceneAttributeOptionCreated(payload: SceneAttributeOptionPayload, addSceneSelectOption: Function){
        addSceneSelectOption(
            payload.optionDefinition.sceneAttributeDefinition?.id,
            {
                label: payload.optionDefinition.name || "Unnamed",
                value: payload.optionDefinition.id
            }
        )
    }
}