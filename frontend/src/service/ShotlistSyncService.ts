import {AnyShotAttribute} from "@/util/Types"
import {SheetManagerRef, ShotCache} from "@/components/shotlist/table/sheetManager/sheetManager"
import {
    CollaborationType,
    SceneAttributeBaseDto,
    SceneDto,
    SceneSelectAttributeOptionDefinition,
    ShotDto,
    ShotSelectAttributeOptionDefinition,
    UserTier,
    Query
} from "../../lib/graphql/generated"
import {SceneAttributeParser, ShotAttributeParser} from "@/util/AttributeParser"
import {ShotlistSidebarRef} from "@/components/shotlist/sidebar/shotlistSidebar/shotlistSidebar"
import {SelectedScene} from "@/app/shotlist/[id]/page"
import {ApolloQueryResult} from "@apollo/client"

export enum ShotlistUpdateType {
    USER_JOINED = "USER_JOINED",
    USER_LEFT = "USER_LEFT",
    COLLABORATION_TYPE_UPDATED = "COLLABORATION_TYPE_UPDATED",
    COLLABORATION_DELETED = "COLLABORATION_DELETED",
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
    SHOTLIST_OPTIONS_UPDATED = "SHOTLIST_OPTIONS_UPDATED",
    COLLABORATOR_CELL_SELECTED = "COLLABORATOR_CELL_SELECTED",
    COLLABORATOR_SCENE_ATTRIBUTE_SELECTED = "COLLABORATOR_SCENE_ATTRIBUTE_SELECTED",
    SHOTLIST_UPDATED = "SHOTLIST_UPDATED",
    SHOTLIST_DELETED = "SHOTLIST_DELETED",

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
    shotId: string
    sceneId: string
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

export interface SelectedCellPayload {
    kind: "selectedCell"
    row: number
    column: number
    sceneId: string
}

export interface SelectedSceneAttributePayload {
    kind: "selectedSceneAttribute"
    attributeId: number
    sceneId: string
}

export interface ShotlistPayload {
    kind: "shotlist"
    shotlist: ShotlistMinimalDTO
}

export interface EmptyPayload {
    kind: "empty"
}

export type ShotlistUpdatePayload =
    UserPayload |
    ShotAttributePayload |
    ShotPayload |
    CollaborationPayload |
    PresentCollaboratorsPayload |
    ScenePayload |
    SceneAttributePayload |
    SceneAttributeOptionPayload |
    ShotAttributeOptionPayload |
    SelectedCellPayload |
    SelectedSceneAttributePayload |
    ShotlistPayload |
    EmptyPayload

/* other stuff */

export interface UserMinimalDTO {
    id: string,
    email: string,
    auth0Sub: string,
    name: string,
    tier: UserTier,
    createdAt: Date
}

export interface ShotlistMinimalDTO {
    id: string
    ownerId: string
    templateId: string
    name: string
    isArchived: boolean
    createdAt: Date
    editedAt: Date
}

export class ShotlistSyncService {
    shotlistId: string
    isReadOnly: boolean = false
    collaboratorSelectedCell: Map<string, SelectedCellPayload> = new Map();
    collaboratorSelectedSceneAttribute: Map<string, SelectedSceneAttributePayload> = new Map();

    constructor(shotlistId: string) {
        this.shotlistId = shotlistId
    }

    updateShotAttribute(payload: ShotAttributePayload, sheetManager: SheetManagerRef | null, selectedSceneId: string | null){
        const sheetCellRef = sheetManager?.findCellRef(payload.attribute.id)

        const valueCollection = ShotAttributeParser.toValueCollection(payload.attribute)
        sheetManager?.updateShotCacheShotAttributeValue(valueCollection, payload.attribute.id, payload.shotId, payload.sceneId)

        if(payload.sceneId == selectedSceneId) {
            sheetCellRef?.setReadOnlyValue(ShotAttributeParser.toValueString(payload.attribute, false))
            sheetCellRef?.setValue(ShotAttributeParser.toMultiTypeValue(payload.attribute))
        }
    }

    createShot(payload: ShotPayload, sheetManager: SheetManagerRef | null, selectedSceneId: string | null){
        if(!payload.shot || !payload.shot.id || !sheetManager) return

        if(payload.shot.sceneId == selectedSceneId) {
            sheetManager.onCreateShot(payload.shot)
        }
        else{
            const currentCache = sheetManager.shotCache.current.get(payload.shot.sceneId || "")

            if(!currentCache) return

            const newShots = [...currentCache.shots, payload.shot]
            sheetManager.updateShotCache(newShots, payload.shot.sceneId)
        }

    }

    updateShot(payload: ShotPayload, sheetManager: SheetManagerRef | null, selectedSceneId: string | null){
        if(!payload.shot || !payload.shot.id || !sheetManager) return

        if(payload.shot.sceneId == selectedSceneId) {
            sheetManager.onMoveShot(payload.shot.id, payload.shot.position)
        }
        else {
            const currentCache = sheetManager.shotCache.current.get(payload.shot.sceneId || "")

            if(!currentCache) return

            const newShots = currentCache.shots.map(shot => shot.id == payload.shot.id ? payload.shot : shot)
            sheetManager.updateShotCache(newShots, payload.shot.sceneId)
        }
    }

    deleteShot(payload: ShotPayload, sheetManager: SheetManagerRef | null, selectedSceneId: string | null){
        if(!payload.shot || !payload.shot.id || !sheetManager) return

        if(payload.shot.sceneId == selectedSceneId) {
            sheetManager.onDeleteShot(payload.shot.id)
        }
        else {
            const currentCache = sheetManager.shotCache.current.get(payload.shot.sceneId || "")

            if(!currentCache) return

            const newShots = currentCache.shots.filter(shot => shot.id != payload.shot.id)
            sheetManager.updateShotCache(newShots, payload.shot.sceneId)
        }
    }

    updateSceneAttribute(payload: SceneAttributePayload, sidebar: ShotlistSidebarRef | null){
        const attributeRef = sidebar?.findAttribute(payload.attribute.id)

        attributeRef?.setReadOnlyValue(SceneAttributeParser.toValueString(payload.attribute, false))
        attributeRef?.setValue(SceneAttributeParser.toMultiTypeValue(payload.attribute))
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

    collaboratorTypeChanged(payload: CollaborationPayload, setQuery: (value: (((prevState: ApolloQueryResult<Query>) => ApolloQueryResult<Query>) | ApolloQueryResult<Query>)) => void){
        setQuery(prev => {
            if (!prev.data?.shotlist) return prev

            //possible change to the current users collaboration type - causes reload of read only state
            return {
                ...prev,
                data: {
                    ...prev.data,
                    shotlist: {
                        ...prev.data.shotlist,
                        collaborations: prev.data.shotlist.collaborations?.map(collab => {
                                if(collab?.user?.id === payload.userId)
                                    return {...collab, collaborationType: payload.type}
                                else
                                    return collab
                            }
                        )
                    }
                }
            }
        })
    }

    setCollaboratorCellHighlight(updateDTO: ShotlistUpdateDTO, selectedScene: SelectedScene, sheetManagerRef: SheetManagerRef | null){
        if(updateDTO.payload.kind != "selectedCell") return

        if(updateDTO.payload.sceneId == selectedScene.id) { //the new highlight is in the currently selected scene
            //remove the highlight from the previously selected cell
            if (this.collaboratorSelectedCell.has(updateDTO.userId)) {
                const currentlySelected = this.collaboratorSelectedCell.get(updateDTO.userId)

                if (currentlySelected != updateDTO.payload) {
                    sheetManagerRef
                        ?.getCellRef(
                            currentlySelected?.row ?? -1,
                            currentlySelected?.column ?? -1
                        )
                        ?.removeCollaboratorHighlight(updateDTO.userId)
                }
            }

            sheetManagerRef
                ?.getCellRef(
                    updateDTO.payload?.row ?? -1,
                    updateDTO.payload?.column ?? -1
                )
                ?.setCollaboratorHighlight(updateDTO.userId)
        }
        this.collaboratorSelectedCell.set(updateDTO.userId, updateDTO.payload)
    }

    setCollaboratorSceneAttributeHighlight(updateDTO: ShotlistUpdateDTO, selectedScene: SelectedScene, sidebarRef: ShotlistSidebarRef | null){
        if(updateDTO.payload.kind != "selectedSceneAttribute") return

        if(updateDTO.payload.sceneId == selectedScene.id) { //the new highlight is in the currently selected scene
            //remove the highlight from the previously selected attribute
            if (this.collaboratorSelectedSceneAttribute.has(updateDTO.userId)) {
                const currentlySelected = this.collaboratorSelectedSceneAttribute.get(updateDTO.userId)

                if (currentlySelected != updateDTO.payload) {
                    sidebarRef
                        ?.findAttribute(currentlySelected?.attributeId ?? -1)
                        ?.removeCollaboratorHighlight(updateDTO.userId)
                }
            }

            sidebarRef
                ?.findAttribute(updateDTO.payload?.attributeId ?? -1)
                ?.setCollaboratorHighlight(updateDTO.userId)
        }
        this.collaboratorSelectedSceneAttribute.set(updateDTO.userId, updateDTO.payload)
    }
}