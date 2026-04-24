import {RefObject, useEffect, useRef, useState, Dispatch, SetStateAction} from "react"
import {useLatestCallback} from "@/utility/useLatestCallback"
import {AnyShotAttribute, SelectOption, ShotlyErrorCode} from "@/utility/Types"
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
import Config from "@/Config"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {SheetManagerRef} from "@/components/app/shotlist/table/sheetManager/sheetManager"
import {PresentCollaborator, SelectedScene} from "@/app/shotlist/[id]/page"
import {SceneAttributeParser, ShotAttributeParser} from "@/utility/AttributeParser"
import {ShotlistSidebarRef} from "@/components/app/shotlist/sidebar/shotlistSidebar/shotlistSidebar"
import {ApolloQueryResult} from "@apollo/client"
import {useRouter} from "next/navigation"

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

export function useShotlistSync({
    shotlistId,
    userId,
    sheetManagerRef,
    sidebarRef,
    selectedScene,
    setQuery,
    setIsArchived,
    setReloadInProgress,
    presentCollaborators,
    setPresentCollaborators,
    addShotSelectOption,
    addSceneSelectOption,
    refreshShotlist
}:{
    shotlistId: string | null
    userId: string | null

    sheetManagerRef: RefObject<SheetManagerRef | null>
    sidebarRef: RefObject<ShotlistSidebarRef | null>

    selectedScene: SelectedScene | null

    setQuery: Dispatch<SetStateAction<ApolloQueryResult<Query>>>
    setIsArchived: Dispatch<SetStateAction<boolean>>
    setReloadInProgress: Dispatch<SetStateAction<boolean>>

    presentCollaborators: Map<string, PresentCollaborator>
    setPresentCollaborators: Dispatch<SetStateAction<Map<string, PresentCollaborator>>>

    addShotSelectOption: (shotAttributeDefinitionId: number, option: SelectOption) => void
    addSceneSelectOption: (sceneAttributeDefinitionId: number, option: SelectOption) => void

    refreshShotlist: () => Promise<void>
}) {
    const router = useRouter()

    const websocketRef = useRef<WebSocket | null>(null)
    const websocketRetriesRef = useRef<number>(0)

    const collaboratorSelectedCell = useRef<Map<string, SelectedCellPayload>>(new Map())
    const collaboratorSelectedSceneAttribute = useRef<Map<string, SelectedSceneAttributePayload>>(new Map())

    useEffect(() => {
        if(!shotlistId || !userId) return

        connect()

        //reconnect websocket
        const handleOnline = () => reconnect();
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") reconnect();
        };

        window.addEventListener("online", handleOnline);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (
                websocketRef.current &&
                (websocketRef.current.readyState === WebSocket.OPEN || websocketRef.current.readyState === WebSocket.CONNECTING)
            ) {
                websocketRef.current?.close(1000, "client logout")
                websocketRef.current = null

                window.removeEventListener("online", handleOnline);
                document.removeEventListener("visibilitychange", handleVisibilityChange);
            }
        }
    }, [shotlistId, userId]);

    const connect = useLatestCallback((showNotifications: boolean = false) => {
        console.log("initially connecting to socket")

        if (websocketRef.current) {
            websocketRef.current.onclose = null
            websocketRef.current.onerror = null
            websocketRef.current.close(1000, "client relog")
        }

        websocketRef.current = new WebSocket(`${Config.websocketURL}/shotlist/${shotlistId}/${userId}`)

        websocketRef.current.onopen = () => {
            console.info('Connected to WebSocket server')
            websocketRetriesRef.current = 0

            if(showNotifications)
                successNotification({
                    title: "Connected to sync service",
                    message: "Incoming changes can now be synced in real-time",
                })
        }

        websocketRef.current.onmessage = (message) => {
            const updateDTO = JSON.parse(message.data) as ShotlistUpdateDTO

            if(!updateDTO) {
                errorNotification({
                    title: "Could not sync incoming changes",
                    message: "If reconnecting doesnt work please reload the page.",
                    action: {
                        label: "Reconnect",
                        onClick: () => {
                            reconnect()
                        }
                    }
                })
                return
            }

            processUpdate(updateDTO)
        }

        websocketRef.current.onclose = (event) => {
            console.info('Disconnected from WebSocket server')

            if (event.code !== 1000) {
                reconnect()
            }
        }

        websocketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error)

            errorNotification({
                title: "Could not sync incoming changes",
                message: "If reconnecting doesnt work please reload the page.",
                action: {
                    label: "Reconnect",
                    onClick: () => {
                        reconnect()
                    }
                }
            })
        }
    })

    const reconnect = useLatestCallback(() => {
        if (!userId || !shotlistId) return

        if (websocketRef.current?.readyState === WebSocket.OPEN || websocketRef.current?.readyState === WebSocket.CONNECTING) {
            return
        }

        const delay = Math.min(1000 * 2 ** websocketRetriesRef.current, 30000)

        setTimeout(() => {
            websocketRetriesRef.current++
            console.info("Attempting reconnect, attempt", websocketRetriesRef.current, "with user id", userId)
            connect()
        }, delay)
    })

    const send = (updateDTO: ShotlistUpdateDTO) => {
        if(!websocketRef.current) return

        websocketRef.current.send(JSON.stringify(updateDTO))
    }

    const processUpdate = useLatestCallback((updateDTO: ShotlistUpdateDTO) => {
        switch (updateDTO.payload.kind) {
            case "shotAttribute":
                updateShotAttribute(updateDTO.payload)
                break
            case "shot":
                switch (updateDTO.type) {
                    case ShotlistUpdateType.SHOT_ADDED:
                        createShot(updateDTO.payload)
                        break
                    case ShotlistUpdateType.SHOT_UPDATED:
                        updateShot(updateDTO.payload)
                        break
                    case ShotlistUpdateType.SHOT_DELETED:
                        deleteShot(updateDTO.payload)
                        break
                }
                break
            case "user":
                const userPayload = updateDTO.payload as UserPayload

                // skip if current state is newer than incoming
                // don't update if the user has been updated from a later message already
                // (avoid desyncs due to delayed messages)
                if(
                    (presentCollaborators?.get(userPayload.user.id)?.updatedAt?.getTime() || Infinity)
                    < new Date(updateDTO.timestamp).getTime()
                ) {
                    return
                }

                if(updateDTO.type == ShotlistUpdateType.USER_JOINED){
                    setPresentCollaborators(prev => {
                        const newMap = new Map(prev)
                        newMap.set(userPayload.user.id, {
                            updatedAt: new Date(updateDTO.timestamp),
                            user: userPayload.user
                        })
                        return newMap
                    })
                }
                else if(updateDTO.type == ShotlistUpdateType.USER_LEFT){
                    setPresentCollaborators(prev => {
                        const newMap = new Map(prev)
                        newMap.forEach(collab => {
                            if(collab.user.id == userPayload.user.id)
                                newMap.delete(collab.user.id)
                        })
                        return newMap
                    })
                }
                break
            case "collaboration":
                switch (updateDTO.type){
                    case ShotlistUpdateType.COLLABORATION_TYPE_UPDATED:
                        //a collaboration type changed (we are only interested in possible changes to our own collaboration types)
                        collaboratorTypeChanged(
                            updateDTO.payload as CollaborationPayload
                        )
                        break
                    case ShotlistUpdateType.COLLABORATION_DELETED:
                        if(userId == updateDTO.payload.userId){
                            setQuery(current => ({
                                ...current,
                                errors: [{
                                    message: "Your collaboration to shotlist has been removed",
                                    extensions: { code: ShotlyErrorCode.READ_NOT_ALLOWED }
                                }]
                            }))
                        }
                        break
                }
                break
            case "presentCollaborators":
                const collabMap = new Map<string, PresentCollaborator>()
                updateDTO.payload.collaborators.forEach(user => collabMap.set(user.id, {user: user, updatedAt: updateDTO.timestamp}))
                setPresentCollaborators(collabMap)
                break
            case "sceneAttribute":
                updateSceneAttribute(updateDTO.payload)
                break
            case "scene":
                switch (updateDTO.type) {
                    case ShotlistUpdateType.SCENE_ADDED:
                        createScene(updateDTO.payload)
                        break
                    case ShotlistUpdateType.SCENE_DELETED:
                        deleteScene(updateDTO.payload)
                        break
                    case ShotlistUpdateType.SCENE_UPDATED:
                        updateScene(updateDTO.payload)
                        break
                }
                break
            case "sceneAttributeOption":
                sceneAttributeOptionCreated(updateDTO.payload)
                break
            case "shotAttributeOption":
                shotAttributeOptionCreated(updateDTO.payload)
                break
            case "selectedCell":
                setCollaboratorCellHighlight(updateDTO)
                break
            case "selectedSceneAttribute":
                setCollaboratorSceneAttributeHighlight(updateDTO)
                break
            case "shotlist":
                const shotlistPayload = updateDTO.payload as ShotlistPayload
                switch (updateDTO.type) {
                    case ShotlistUpdateType.SHOTLIST_UPDATED:
                        setQuery(current => ({
                            ...current,
                            data: {
                                ...current.data,
                                shotlist: {
                                    ...current.data.shotlist,
                                    name: shotlistPayload.shotlist.name,
                                    archived: shotlistPayload.shotlist.isArchived
                                }
                            }
                        }))
                        setIsArchived(shotlistPayload.shotlist.isArchived)
                        break
                    case ShotlistUpdateType.SHOTLIST_DELETED:
                        setReloadInProgress(true)
                        errorNotification({
                            title: "This Shotlist has been deleted",
                            message: "It appears this shotlist has just been deleted, you will be sent to your dashboard in 5 seconds."
                        })
                        setTimeout(() => {
                            router.push("/dashboard")
                        },5000)
                        break
                }
                break
            case "empty":
                switch (updateDTO.type) {
                    case ShotlistUpdateType.SHOTLIST_OPTIONS_UPDATED:
                        refreshShotlist()
                        break
                }
                break
        }
    })

    const updateShotAttribute = (payload: ShotAttributePayload)=> {
        if(!sheetManagerRef.current) return

        const sheetCellRef = sheetManagerRef.current.findCellRef(payload.attribute.id)

        const valueCollection = ShotAttributeParser.toValueCollection(payload.attribute)
        sheetManagerRef.current.updateShotCacheShotAttributeValue(valueCollection, payload.attribute.id, payload.shotId, payload.sceneId)

        if(payload.sceneId == selectedScene?.id) {
            sheetCellRef?.setReadOnlyValue(ShotAttributeParser.toValueString(payload.attribute, false))
            sheetCellRef?.setValue(ShotAttributeParser.toMultiTypeValue(payload.attribute))
        }
    }

    const createShot = (payload: ShotPayload)=> {
        if(!payload.shot || !payload.shot.id || !sheetManagerRef?.current) return

        if(payload.shot.sceneId == selectedScene?.id) {
            sheetManagerRef.current.onCreateShot(payload.shot)
        }
        else{
            const currentCache = sheetManagerRef.current.shotCache.current.get(payload.shot.sceneId || "")

            if(!currentCache) return

            const newShots = [...currentCache.shots, payload.shot]
            sheetManagerRef.current.updateShotCache(newShots, payload.shot.sceneId)
        }

    }

    const updateShot = (payload: ShotPayload)=> {
        if(!payload.shot || !payload.shot.id || !sheetManagerRef?.current) return

        if(payload.shot.sceneId == selectedScene?.id) {
            sheetManagerRef.current.onMoveShot(payload.shot.id, payload.shot.position)
        }
        else {
            const currentCache = sheetManagerRef.current.shotCache.current.get(payload.shot.sceneId || "")

            if(!currentCache) return

            const newShots = currentCache.shots.map(shot => shot.id == payload.shot.id ? payload.shot : shot)
            sheetManagerRef.current.updateShotCache(newShots, payload.shot.sceneId)
        }
    }

    const deleteShot = (payload: ShotPayload)=> {
        if(!payload.shot || !payload.shot.id || !sheetManagerRef?.current) return

        if(payload.shot.sceneId == selectedScene?.id) {
            sheetManagerRef?.current.onDeleteShot(payload.shot.id)
        }
        else {
            const currentCache = sheetManagerRef?.current.shotCache.current.get(payload.shot.sceneId || "")

            if(!currentCache) return

            const newShots = currentCache.shots.filter(shot => shot.id != payload.shot.id)
            sheetManagerRef?.current.updateShotCache(newShots, payload.shot.sceneId)
        }
    }

    const updateSceneAttribute = (payload: SceneAttributePayload)=> {
        const attributeRef = sidebarRef?.current?.findAttribute(payload.attribute.id)

        attributeRef?.setReadOnlyValue(SceneAttributeParser.toValueString(payload.attribute, false))
        attributeRef?.setValue(SceneAttributeParser.toMultiTypeValue(payload.attribute))
    }

    const createScene = (payload: ScenePayload)=> {
        if(!payload.scene || !payload.scene.id || !sidebarRef?.current) return

        sidebarRef?.current.onCreateScene(payload.scene)
    }

    const updateScene = (payload: ScenePayload)=> {
        if(!payload.scene || !payload.scene.id || !sidebarRef?.current) return

        sidebarRef?.current.onMoveScene(payload.scene.id, payload.scene.position)
    }

    const deleteScene = (payload: ScenePayload)=> {
        if(!payload.scene || !payload.scene.id || !sidebarRef?.current) return

        sidebarRef?.current.onDeleteScene(payload.scene.id)
    }

    const shotAttributeOptionCreated = (payload: ShotAttributeOptionPayload)=> {
        addShotSelectOption(
            payload.optionDefinition.shotAttributeDefinition?.id,
            {
                label: payload.optionDefinition.name || "Unnamed",
                value: payload.optionDefinition.id
            }
        )
    }

    const sceneAttributeOptionCreated = (payload: SceneAttributeOptionPayload)=> {
        addSceneSelectOption(
            payload.optionDefinition.sceneAttributeDefinition?.id,
            {
                label: payload.optionDefinition.name || "Unnamed",
                value: payload.optionDefinition.id
            }
        )
    }

    const collaboratorTypeChanged = (payload: CollaborationPayload)=> {
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

    const setCollaboratorCellHighlight = (updateDTO: ShotlistUpdateDTO)=> {
        if(updateDTO.payload.kind != "selectedCell") return

        if(updateDTO.payload.sceneId == selectedScene?.id) { //the new highlight is in the currently selected scene
            //remove the highlight from the previously selected cell
            if (collaboratorSelectedCell.current.has(updateDTO.userId)) {
                const currentlySelected = collaboratorSelectedCell.current.get(updateDTO.userId)

                if (currentlySelected != updateDTO.payload) {
                    sheetManagerRef?.current
                        ?.getCellRef(
                            currentlySelected?.row ?? -1,
                            currentlySelected?.column ?? -1
                        )
                        ?.removeCollaboratorHighlight(updateDTO.userId)
                }
            }

            sheetManagerRef?.current
                ?.getCellRef(
                    updateDTO.payload?.row ?? -1,
                    updateDTO.payload?.column ?? -1
                )
                ?.setCollaboratorHighlight(updateDTO.userId)
        }
        collaboratorSelectedCell.current.set(updateDTO.userId, updateDTO.payload)
    }

    const setCollaboratorSceneAttributeHighlight = (updateDTO: ShotlistUpdateDTO)=> {
        if(updateDTO.payload.kind != "selectedSceneAttribute") return

        if(updateDTO.payload.sceneId == selectedScene?.id) { //the new highlight is in the currently selected scene
            //remove the highlight from the previously selected attribute
            if (collaboratorSelectedSceneAttribute.current.has(updateDTO.userId)) {
                const currentlySelected = collaboratorSelectedSceneAttribute.current.get(updateDTO.userId)

                if (currentlySelected != updateDTO.payload) {
                    sidebarRef?.current
                        ?.findAttribute(currentlySelected?.attributeId ?? -1)
                        ?.removeCollaboratorHighlight(updateDTO.userId)
                }
            }

            sidebarRef?.current
                ?.findAttribute(updateDTO.payload?.attributeId ?? -1)
                ?.setCollaboratorHighlight(updateDTO.userId)
        }
        collaboratorSelectedSceneAttribute.current.set(updateDTO.userId, updateDTO.payload)
    }

    return {connect, send}
}