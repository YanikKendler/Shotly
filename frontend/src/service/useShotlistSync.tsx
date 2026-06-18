import {Dispatch, RefObject, SetStateAction, useContext, useEffect, useRef} from "react"
import {useLatestCallback} from "@/utility/useLatestCallback"
import {SelectOption, ShotlyErrorCode} from "@/utility/Types"
import {
    CollaborationPayload,
    CommentPayload,
    Query,
    SceneAttributePayload,
    ScenePayload,
    SceneSelectOptionPayload,
    SelectedCellPayload,
    SelectedSceneAttributePayload,
    ShotAttributePayload,
    ShotlistPayload,
    ShotlistUpdateDto,
    ShotlistUpdateType,
    ShotPayload,
    ShotSelectOptionPayload,
    UserMinimalDto,
    UserPayload
} from "../../lib/graphql/generated"
import {errorNotification} from "@/service/NotificationService"
import {SheetManagerRef} from "@/components/app/shotlist/table/sheetManager/sheetManager"
import {PresentCollaborator, SelectedScene} from "@/app/(application)/shotlist/[id]/page"
import {SceneAttributeParser, ShotAttributeParser} from "@/utility/AttributeParser"
import {SceneListRef} from "@/components/app/shotlist/sidebar/sceneList/sceneList"
import {ApolloQueryResult, useApolloClient, useSubscription} from "@apollo/client"
import {useRouter} from "next/navigation"
import gql from "graphql-tag"
import {wuConstants} from "@yanikkendler/web-utils/dist"

/**
 * It would be lovely to only query the shot attributes for example if the shot was created
 * but not if it was moved.
 * But as far as I know it is not possible to query more or less data per type based on other data.
 *
 * TODO might be worth duplicating the payloads in the backend just to be able to define the query here
 */
const SHOTLIST_UPDATES_SUBSCRIPTION = gql`
    subscription OnShotlistUpdate($shotlistId: String!, $userId: String!) {
        shotlistUpdates(shotlistId: $shotlistId, userId: $userId) {
            type
            userId
            timestamp
            payload {
                ... on PresentCollaboratorsPayload {
                    collaborators {
                        id
                        name
                    }
                }
                ... on UserPayload {
                    user {
                        id
                        name
                    }
                }
                ... on CollaborationPayload {
                    userId
                    type
                }
                ... on ShotAttributePayload {
                    shotId
                    sceneId
                    attribute {
                        id
                        definition {
                            id
                            name
                            position
                        }
                        ... on ShotSingleSelectAttributeDTO {
                            singleSelectValue {
                                id
                                name
                            }
                        }
                        ... on ShotMultiSelectAttributeDTO {
                            multiSelectValue {
                                id
                                name
                            }
                        }
                        ... on ShotTextAttributeDTO {
                            textValue
                        }
                    }
                }
                ... on ShotPayload {
                    shot {
                        id
                        position
                        sceneId
                        subshot
                        attributes {
                            id
                            definition {
                                id
                                name
                                position
                            }
                            ... on ShotSingleSelectAttributeDTO {
                                singleSelectValue {
                                    id
                                    name
                                }
                            }
                            ... on ShotMultiSelectAttributeDTO {
                                multiSelectValue {
                                    id
                                    name
                                }
                            }
                            ... on ShotTextAttributeDTO {
                                textValue
                            }
                        }
                    }
                }
                ... on SceneAttributePayload {
                    attribute {
                        id
                        definition {
                            id
                            name
                            position
                        }
                        ... on SceneSingleSelectAttributeDTO {
                            singleSelectValue {
                                id
                                name
                            }
                        }
                        ... on SceneMultiSelectAttributeDTO {
                            multiSelectValue {
                                id
                                name
                            }
                        }
                        ... on SceneTextAttributeDTO {
                            textValue
                        }
                    }
                }
                ... on ScenePayload {
                    scene {
                        id
                        position
                        shotCount
                        attributes {
                            id
                            definition {
                                id
                                name
                                position
                            }
                            ... on SceneSingleSelectAttributeDTO {
                                singleSelectValue {
                                    id
                                    name
                                }
                            }
                            ... on SceneMultiSelectAttributeDTO {
                                multiSelectValue {
                                    id
                                    name
                                }
                            }
                            ... on SceneTextAttributeDTO {
                                textValue
                            }
                        }
                    }
                }
                ... on SceneSelectOptionPayload {
                    optionDefinition {
                        id
                        name
                        sceneAttributeDefinition {
                            id
                        }
                    }
                }
                ... on ShotSelectOptionPayload {
                    optionDefinition {
                        id
                        name
                        shotAttributeDefinition {
                            id
                        }
                    }
                }
                ... on SelectedCellPayload {
                    row
                    column
                    sceneId
                }
                ... on SelectedSceneAttributePayload {
                    attributeId
                    sceneId
                }
                ... on ShotlistPayload {
                    shotlist {
                        name
                        archived
                    }
                }
                ... on CommentPayload {
                    comment {
                        id,
                        owner {
                            id,
                            name
                        },
                        text,
                        edited,
                        shotId,
                        sceneId,
                        archived
                    }
                }
                ... on EmptyPayload {
                    success
                }
            }
        }
    }
`

export function useShotlistSync({
    shotlistId,
    currentUserId,
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
    currentUserId: string | null

    sheetManagerRef: RefObject<SheetManagerRef | null>
    sidebarRef: RefObject<SceneListRef | null>

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
    const client = useApolloClient()
    const router = useRouter()

    const collaboratorSelectedCell = useRef<Map<string, SelectedCellPayload>>(new Map())
    const collaboratorSelectedSceneAttribute = useRef<Map<string, SelectedSceneAttributePayload>>(new Map())

    const initialConnectTimestamp = useRef<number>(-1);

    const { data, loading, error, restart } = useSubscription(SHOTLIST_UPDATES_SUBSCRIPTION, {
        skip: !currentUserId || !shotlistId,
        variables: { shotlistId, userId: currentUserId },
        shouldResubscribe: true,
        onData: ({ data }) => {
            const updateDTO = data.data.shotlistUpdates

            if (updateDTO) {
                processUpdate(updateDTO)
            }
        }
    })

    useEffect(() => {
        if (error) {
            console.error('GraphQL Subscription error:', error)
            errorNotification({
                title: "Shotlist sync error.",
                message: "Connection lost. Automatically retrying!",
                autoClose: 5000
            })
        }
        if(!error && !loading){
            if(initialConnectTimestamp.current == -1)
                initialConnectTimestamp.current = Date.now()
            else if(initialConnectTimestamp.current < Date.now() - wuConstants.Time.msPerSecond * 10)
                refreshShotlist().then()
        }
    }, [error, loading])

    const processUpdate = useLatestCallback((updateDTO: ShotlistUpdateDto) => {
        switch (updateDTO.payload?.__typename) {
            case "ShotAttributePayload":
                updateShotAttribute(updateDTO.payload)
                break
            case "ShotPayload":
                switch (updateDTO.type) {
                    case ShotlistUpdateType.ShotAdded:
                        createShot(updateDTO.payload)
                        break
                    case ShotlistUpdateType.ShotUpdated:
                        updateShot(updateDTO.payload)
                        break
                    case ShotlistUpdateType.ShotDeleted:
                        deleteShot(updateDTO.payload)
                        break
                }
                break
            case "UserPayload":
                const userPayload = updateDTO.payload as UserPayload

                const userId = userPayload.user?.id

                // skip if current state is newer than incoming
                // don't update if the user has been updated from a later message already
                // (avoid desyncs due to delayed messages)
                if(
                    !userId ||
                    (presentCollaborators?.get(userId)?.updatedAt?.getTime() || Infinity)
                    < new Date(updateDTO.timestamp).getTime()
                ) {
                    return
                }

                if(updateDTO.type == ShotlistUpdateType.UserJoined){
                    if(!userPayload.user) return

                    setPresentCollaborators(prev => {
                        const newMap = new Map(prev)
                        newMap.set(userId, {
                            updatedAt: new Date(updateDTO.timestamp),
                            user: userPayload.user as UserMinimalDto
                        })
                        return newMap
                    })
                }
                else if(updateDTO.type == ShotlistUpdateType.UserLeft){
                    setPresentCollaborators(prev => {
                        const newMap = new Map(prev)
                        newMap.forEach(collab => {
                            if(collab.user.id == userId)
                                newMap.delete(collab.user.id)
                        })
                        return newMap
                    })
                }
                break
            case "CollaborationPayload":
                switch (updateDTO.type){
                    case ShotlistUpdateType.CollaborationTypeUpdated:
                        collaboratorTypeChanged(
                            updateDTO.payload as CollaborationPayload
                        )
                        break
                    case ShotlistUpdateType.CollaborationDeleted:
                        if(currentUserId == updateDTO.payload.userId){
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
            case "PresentCollaboratorsPayload":
                const collabMap = new Map<string, PresentCollaborator>()
                updateDTO.payload.collaborators?.forEach(user => {
                    if(!user?.id) return
                    collabMap.set(user?.id ?? "unknown", {user: user, updatedAt: updateDTO.timestamp})
                })
                setPresentCollaborators(collabMap)
                break
            case "SceneAttributePayload":
                updateSceneAttribute(updateDTO.payload)
                break
            case "ScenePayload":
                switch (updateDTO.type) {
                    case ShotlistUpdateType.SceneAdded:
                        createScene(updateDTO.payload)
                        break
                    case ShotlistUpdateType.SceneDeleted:
                        deleteScene(updateDTO.payload)
                        break
                    case ShotlistUpdateType.SceneUpdated:
                        updateScene(updateDTO.payload)
                        break
                }
                break
            case "SceneSelectOptionPayload":
                sceneAttributeOptionCreated(updateDTO.payload)
                break
            case "ShotSelectOptionPayload":
                shotAttributeOptionCreated(updateDTO.payload)
                break
            case "SelectedCellPayload":
                setCollaboratorCellHighlight(updateDTO)
                break
            case "SelectedSceneAttributePayload":
                setCollaboratorSceneAttributeHighlight(updateDTO)
                break
            case "ShotlistPayload":
                const shotlistPayload = updateDTO.payload as ShotlistPayload
                switch (updateDTO.type) {
                    case ShotlistUpdateType.ShotlistUpdated:
                        if(!shotlistPayload.shotlist?.archived) return

                        setQuery(current => ({
                            ...current,
                            data: {
                                ...current.data,
                                shotlist: {
                                    ...current.data.shotlist,
                                    name: shotlistPayload.shotlist?.name,
                                    archived: shotlistPayload.shotlist?.archived
                                }
                            }
                        }))
                        setIsArchived(shotlistPayload.shotlist?.archived)
                        break
                    case ShotlistUpdateType.ShotlistDeleted:
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
            case "CommentPayload":
                switch (updateDTO.type) {
                    case ShotlistUpdateType.CommentAdded:
                        createComment(updateDTO.payload as CommentPayload)
                        break
                    case ShotlistUpdateType.CommentText:
                    case ShotlistUpdateType.CommentArchival:
                        console.log(updateDTO)
                        updateComment(updateDTO.payload as CommentPayload)
                        break
                }
            case "EmptyPayload":
                switch (updateDTO.type) {
                    case ShotlistUpdateType.ShotlistOptionsUpdated:
                        refreshShotlist()
                        break
                }
                break
        }
    })

    const updateShotAttribute = (payload: ShotAttributePayload)=> {
        if(!sheetManagerRef.current || !payload.attribute || !payload.shotId || !payload.sceneId) return

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
        if(
            !payload.shot ||
            !payload.shot.id ||
            !payload.shot.position ||
            !payload.shot.subshot ||
            !sheetManagerRef?.current
        ) return

        if(payload.shot.sceneId == selectedScene?.id) {
            sheetManagerRef.current.onMoveShot(payload.shot.id, payload.shot.position)
        }
        else {
            const currentCache = sheetManagerRef.current.shotCache.current.get(payload.shot.sceneId || "")

            if(!currentCache) return

            const newShots = currentCache.shots
                .map(shot => {
                    if(payload.shot && shot.id == payload.shot?.id)
                        return {
                            ...shot,
                            position: payload.shot.position,
                            subshot: payload.shot.subshot
                        }
                    else
                        return shot
                })
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

            const newShots = currentCache.shots.filter(shot => shot.id != payload.shot?.id)
            sheetManagerRef?.current.updateShotCache(newShots, payload.shot.sceneId)
        }
    }

    const updateSceneAttribute = (payload: SceneAttributePayload)=> {
        if(!payload.attribute) return

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

    const shotAttributeOptionCreated = (payload: ShotSelectOptionPayload)=> {
        if(!payload.optionDefinition) return

        addShotSelectOption(
            payload.optionDefinition.shotAttributeDefinition?.id,
            {
                label: payload.optionDefinition.name || "Unnamed",
                value: payload.optionDefinition.id
            }
        )
    }

    const sceneAttributeOptionCreated = (payload: SceneSelectOptionPayload)=> {
        if(!payload.optionDefinition) return

        addSceneSelectOption(
            payload.optionDefinition.sceneAttributeDefinition?.id,
            {
                label: payload.optionDefinition.name || "Unnamed",
                value: payload.optionDefinition.id
            }
        )
    }

    const collaboratorTypeChanged = (payload: CollaborationPayload)=> {
        //we are only interested if our own permissions changed
        if(currentUserId != payload.userId && payload.type) return

        console.log("updating collaborator type to", payload.type)

        //causes reload of access perm calculation
        setQuery(prev => {
            if (!prev.data?.shotlist) return prev

            return {
                ...prev,
                data: {
                    ...prev.data,
                    shotlistCollaborationType: payload.type
                }
            }
        })
    }

    const createComment = (payload: CommentPayload)=> {
        if(!payload.comment?.id || !payload.comment.shotId || !sheetManagerRef) return

        if(payload.comment?.sceneId == selectedScene?.id) {
            const popoverRef = sheetManagerRef.current
                ?.findRowRef(payload.comment.shotId)
                ?.commentPopoverRef.current

            if(!popoverRef) return

            popoverRef.onCreateComment(payload.comment)
        }
        else{
            sheetManagerRef.current?.addCommentToCache(payload.comment)
        }
    }

    const updateComment = (payload: CommentPayload)=> {
        if(!payload.comment?.id || !payload.comment.shotId || !sheetManagerRef) return

        if(payload.comment?.sceneId == selectedScene?.id) {
            const popoverRef = sheetManagerRef.current
                ?.findRowRef(payload.comment.shotId)
                ?.commentPopoverRef.current

            if(!popoverRef) return

            popoverRef.onUpdateComment(payload.comment)
        }
        else{
            sheetManagerRef.current?.updateCommentInCache(payload.comment)
        }
    }

    // INPUT HIGHLIGHTING

    const setCollaboratorCellHighlight = (updateDTO: ShotlistUpdateDto)=> {
        if(updateDTO.payload?.__typename != "SelectedCellPayload" || !updateDTO.userId) return

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

    const setCollaboratorSceneAttributeHighlight = (updateDTO: ShotlistUpdateDto)=> {
        if(updateDTO.payload?.__typename != "SelectedSceneAttributePayload" || !updateDTO.userId) return

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

    // BROADCAST TO ALL

    const syncShotlistOptionsUpdated = async () => {
        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation syncShotlistOptionsUpdated($shotlistId: String) {
                        syncShotlistOptionsUpdated(shotlistId: $shotlistId)
                    }`,
                variables: {shotlistId: shotlistId}
            },
        )

        if(errors){
            errorNotification({
                title: "Failed to sync options update",
                message: "Please refresh this page, collaborators might need to do the same."
            })
            console.error(errors)
            return
        }
    }

    const syncShotlistCellSelected = async (payload: SelectedCellPayload) => {
        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation syncShotlistCellSelected($shotlistId: String, $payload: SelectedCellPayloadInput) {
                        syncShotlistCellSelected(shotlistId: $shotlistId, payload: $payload)
                    }`,
                variables: {shotlistId: shotlistId, payload: payload}
            },
        )

        if(errors){
            errorNotification({
                title: "Failed to sync cell selection",
                message: "Please refresh this page."
            })
            console.error(errors)
            return
        }
    }

    const syncShotlistSceneAttributeSelected = async (payload: SelectedSceneAttributePayload) => {
        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation syncShotlistSceneAttributeSelected($shotlistId: String, $payload: SelectedSceneAttributePayloadInput) {
                        syncShotlistSceneAttributeSelected(shotlistId: $shotlistId, payload: $payload)
                    }`,
                variables: {shotlistId: shotlistId, payload: payload}
            },
        )

        if(errors){
            errorNotification({
                title: "Failed to sync scene attribute selection",
                message: "Please refresh this page."
            })
            console.error(errors)
            return
        }
    }

    return {
        syncShotlistOptionsUpdated,
        syncShotlistCellSelected,
        syncShotlistSceneAttributeSelected,
        restart
    }
}