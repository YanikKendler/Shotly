'use client'

import gql from "graphql-tag"
import React, {useContext, useEffect, useRef, useState} from "react"
import {ApolloQueryResult, InteropApolloQueryResult, useApolloClient} from "@apollo/client"
import {
    CollaborationDto,
    CollaborationType,
    Query,
    ShotAttributeDefinitionBase,
    UserDto,
    UserTier
} from "../../../../lib/graphql/generated"
import {useParams, useRouter, useSearchParams} from "next/navigation"
import {Check, CircleAlert, House, LoaderCircle, Menu, X} from "lucide-react"
import './shotlist.scss'
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import {ShotlistContext} from "@/context/ShotlistContext"
import ShotlistOptionsDialog, {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import auth from "@/Auth"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Utils, {uuidRegex} from "@/util/Utils"
import Config from "@/util/Config"
import {GenericError, SelectOption, ShotlyErrorCode} from "@/util/Types"
import SheetManager, {SheetManagerRef} from "@/components/shotlist/table/sheetManager/sheetManager"
import ShotlistSidebar, {ShotlistSidebarRef} from "@/components/shotlist/sidebar/shotlistSidebar/shotlistSidebar"
import Skeleton from "react-loading-skeleton"
import {
    CollaborationPayload,
    ShotlistSyncService,
    ShotlistUpdateDTO,
    ShotlistUpdateType,
    UserMinimalDTO,
    UserPayload
} from "@/service/ShotlistSyncService"
import HelpLink from "@/components/helpLink/helpLink"
import Link from "next/link"
import DotLoader from "@/components/DotLoader"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import toast from "react-hot-toast"
import {errorNotification} from "@/service/NotificationService"

export interface SelectedScene {
    id: string | null
    position: number | null
}

export interface ReadOnlyState {
    isReadOnly: boolean
    reason?: "tooManyShotlists" | "collaborationViewOnly"
}

export type SaveState = "saved" | "saving" | "error"

export default function Shotlist() {
    const client = useApolloClient()
    const router = useRouter()
    const syncService = useRef<ShotlistSyncService | null>(null)
    const searchParams = useSearchParams()
    const params = useParams<{ id: string }>()

    const id = params?.id || ""
    /* TODO
    * should handle this better because currently the scene positon is null so the scene nums in the rows would be displayed wrong
    * should probably just shift the selected scene to shotcontext
    */
    const sceneId = searchParams?.get('sid')

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [selectedScene, setSelectedScene] = useState<SelectedScene>({ id: sceneId, position: null })
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false)
    const [selectedOptionsDialogPage, setSelectedOptionsDialogPage] = useState<{main: ShotlistOptionsDialogPage, sub: ShotlistOptionsDialogSubPage} | null>(null)
    const [elementIsBeingDragged, setElementIsBeingDragged] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [readOnlyBannerVisible, setReadOnlyBannerVisible] = useState(true)

    const [reloadKey, setReloadKey] = useState(0)
    const [reloadInProgress, setReloadInProgress] = useState(false)

    const [readOnlyState, setReadOnlyState] = useState<ReadOnlyState>({isReadOnly: false})

    const [shotCount, setShotCount] = useState(0)
    const [sceneCount, setSceneCount] = useState(0)

    const [presentCollaborators, setPresentCollaborators] = useState<Map<string, UserMinimalDTO>>()

    const selectedSceneRef = useRef<SelectedScene>(selectedScene)
    const focusedCell = useRef({row: -1, column:-1})
    const headerRef = useRef<HTMLDivElement>(null)
    const sheetManagerRef = useRef<SheetManagerRef>(null)
    const sidebarRef = useRef<ShotlistSidebarRef>(null);
    const saveIndicatorRef = useRef<HTMLDivElement>(null)

    const [shotSelectOptionsCache, setShotSelectOptionsCache] = useState(new Map<number, SelectOption[]>())
    const [sceneSelectOptionsCache, setSceneSelectOptionsCache] = useState(new Map<number, SelectOption[]>())
    const websocketRef = useRef<WebSocket | null>(null)
    const websocketRetriesRef = useRef<number>(0)

    //this needs to be a ref to avoid captures by the websocket (should probably just have made the whole websocket logic a ref..)
    const refreshShotlistFunction = useRef<() => void>(() => {});
    const currentUserRef = useRef<UserDto | null>(null)

    const saveStateMap = useRef<Map<string, SaveState>>(new Map())

    const driverObj = driver({
        showProgress: true,
        allowClose: true,
        steps: [
            { popover: { title: 'Your first Shotlist', description: 'This is where the fun beginns!' } },
            { element: '#sceneList', popover: { title: 'Scenes', description: 'Every scene has the same attributes(like location, time, actors etc.) which are defined via the shotlist options.', side: "right", align: 'center' }},
            { element: '#shotTable', popover: { title: 'Shots', description: 'Here you see all the shots of the currently selected scene. Each shot has a few attributes which are defined via the shotlist options.', side: "over", align: 'center' }},
            { element: '#shotlistOptions', popover: { title: 'Shotlist Options', description: 'Click here to open the shotlist options menu.', side: "top", align: 'center' }},
        ]
    })

    useEffect(() => {
        refreshShotlistFunction.current = () => {
            setReloadInProgress(true)
            loadData(true).then(() => {
                setReloadInProgress(false)
                setReloadKey(k => k + 1)
            })
            setShotSelectOptionsCache(new Map())
            setSceneSelectOptionsCache(new Map())
        }

        const handleOnline = () => reconnectWebsocket();
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") reconnectWebsocket();
        };

        window.addEventListener("online", handleOnline);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup
        return () => {
            window.removeEventListener("online", handleOnline);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [])

    useEffect(() => {
        if(!auth.isAuthenticated()){
            router.replace('/')
            return
        }

        if(!uuidRegex.test(id)){
            setQuery({
                ...query,
                errors: [{
                    message: "Invalid shotlist id",
                    extensions: { code: ShotlyErrorCode.NOT_FOUND }
                }]
            })
            return
        }

        if(!auth.getUser()) return

        loadData(true).then((query: InteropApolloQueryResult<Query> | undefined) => {
            //use user from the promise as to not run into react state race conditions
            if(id != "" && query?.data.shotlist && query.data.shotlist.id)
                joinShotlistWebsocket(query?.data.currentUser?.id || "unknown")
        })

        syncService.current = new ShotlistSyncService(id)

        return () => {
            websocketRef.current?.close(1000, "client logout")
            websocketRef.current = null
        }
    }, [id])

    useEffect(() => {
        if(syncService.current)
            syncService.current.isReadOnly = readOnlyState.isReadOnly
    }, [readOnlyState]);

    useEffect(() => {
        //intro tour
        if(!query.loading && !query.error && query.data && query.data.shotlist && query.data.shotlist.id) {
            if(localStorage.getItem(Config.localStorageKey.shotlistTourCompleted) != "true") {
                localStorage.setItem(Config.localStorageKey.shotlistTourCompleted, "true")
                driverObj.drive()
            }
        }

        //select first scene if none is selected
        if(
            (
                selectedScene?.id == "" ||
                selectedScene?.id == null
            ) &&
            !query.loading &&
            query.data.shotlist &&
            query.data.shotlist.scenes &&
            query.data.shotlist.scenes[0]?.id != undefined
        ) {
            selectScene(query.data.shotlist.scenes[0].id, query.data.shotlist.scenes[0].position)
        }

        //read only state
        if(query.data.shotlist?.collaborations)
            calculateReadOnlyState()

        //current user ref
        if(query.data.currentUser)
            currentUserRef.current = query.data.currentUser
    }, [query])

    useEffect(() => {
        selectedSceneRef.current = selectedScene
    }, [selectedScene]);

    useEffect(() => {
        shotlistContextFunctionsRef.current = {
            addShotSelectOption,
            addSceneSelectOption
        }
    }, [shotSelectOptionsCache, sceneSelectOptionsCache]);

    const loadData = async (noCache: boolean = false) => {
        const result = await client.query({
            query: gql`
                query shotlist($id: String!){
                    shotlist(id: $id){
                        id
                        name
                        scenes{
                            id
                            position
                            attributes{
                                id
                                definition{
                                    id,
                                    name,
                                    position,
                                    type
                                }
                                type

                                ... on SceneSingleSelectAttributeDTO{
                                    singleSelectValue{id,name}
                                }

                                ... on SceneMultiSelectAttributeDTO{
                                    multiSelectValue{id,name}
                                }
                                ... on SceneTextAttributeDTO{
                                    textValue
                                }
                            }
                        }
                        sceneAttributeDefinitions{
                            id
                            name
                            position
                            type
                        }
                        shotAttributeDefinitions{
                            id
                            name
                            position
                            type
                        }
                        owner {
                            id
                            tier
                            shotlistCount
                        }
                        collaborations {
                            user {
                                id
                            }
                            collaborationType
                        }
                    }
                    currentUser {
                        id
                    }
                }`,
            variables: {id: id},
            fetchPolicy: noCache ? "no-cache" : "cache-first",
        })

        if(result.errors) {
            handleShotlistError({
                locationKey: "loadShotlist",
                message: "Failed to load Shotlist.",
                cause: result.errors
            })
            setQuery(result)
            return
        }

        setSceneCount(result.data.shotlist?.scenes?.length || 0)

        setQuery(result)

        return result
    }

    const handleShotlistError = (error: GenericError) => {
        console.error(error)

        errorNotification({
            title: `Oh no, an error occurred at "${error.locationKey}".`,
            message: error.message
        })
    }

    const setSaveState = (key: string, state: SaveState) => {
        saveStateMap.current.set(key, state)

        let newFinalState: SaveState = "saved"

        const values = Array.from(saveStateMap.current.values() || [])

        if(values.includes("error")) {
            newFinalState = "error"
        }
        else if(values.includes("saving")) {
            newFinalState = "saving"
        }

        if(saveIndicatorRef.current) {
            saveIndicatorRef.current.setAttribute("data-state", newFinalState)
        }
    }

    const setFocusedCell= (row: number, column: number) => {
        focusedCell.current = {row, column}

        const updateDTO: ShotlistUpdateDTO = {
            type: ShotlistUpdateType.COLLABORATOR_CELL_SELECTED,
            userId: query.data.currentUser?.id || "unknown",
            timestamp: new Date(),
            payload: {
                kind: "selectedCell",
                row: row,
                column: column,
                sceneId: selectedScene.id || "unknown"
            }
        }

        websocketRef.current?.send(JSON.stringify(updateDTO))
    }

    const broadCastSceneAttributeSelect = (attributeId: number) => {
        const updateDTO: ShotlistUpdateDTO = {
            type: ShotlistUpdateType.COLLABORATOR_SCENE_ATTRIBUTE_SELECTED,
            userId: query.data.currentUser?.id || "unknown",
            timestamp: new Date(),
            payload: {
                kind: "selectedSceneAttribute",
                sceneId: selectedScene.id || "unknown",
                attributeId: attributeId
            }
        }

        websocketRef.current?.send(JSON.stringify(updateDTO))
    }

    //TODO move this to the service completely or make it a use hook or at least a ref function to avoid captures
    const joinShotlistWebsocket = (currentUserId: string) => {
        if (websocketRef.current) {
            websocketRef.current.onclose = null
            websocketRef.current.onerror = null
            websocketRef.current.close(1000, "client relog")
        }

        const websocket = new WebSocket(`${Config.websocketURL}/shotlist/${id}/${currentUserId}`)
        websocketRef.current = websocket

        websocket.onopen = () => {
            console.info('Connected to WebSocket server')
            websocketRetriesRef.current = 0
        }
        websocket.onmessage = (message) => {
            let updateDTO = JSON.parse(message.data) as ShotlistUpdateDTO

            if(!updateDTO) {
                errorNotification({
                    title: "Could not sync incoming changes.",
                    sub: "Try refreshing the page to fix the issue",
                })
                return
            }

            if(!syncService.current) {
                console.error("syncService not initialized")
                return
            }

            switch (updateDTO.payload.kind) {
                case "shotAttribute":
                    syncService.current.updateShotAttribute(updateDTO.payload, sheetManagerRef.current)
                    break
                case "shot":
                    if(updateDTO.payload.shot.sceneId != selectedSceneRef.current.id) return

                    switch (updateDTO.type) {
                        case ShotlistUpdateType.SHOT_ADDED:
                            syncService.current.createShot(updateDTO.payload, sheetManagerRef.current)
                            break
                        case ShotlistUpdateType.SHOT_UPDATED:
                            syncService.current.updateShot(updateDTO.payload, sheetManagerRef.current)
                            break
                        case ShotlistUpdateType.SHOT_DELETED:
                            syncService.current.deleteShot(updateDTO.payload, sheetManagerRef.current)
                            break
                    }
                    break
                case "user":
                    const userPayload = updateDTO.payload as UserPayload
                    if(updateDTO.type == ShotlistUpdateType.USER_JOINED){
                        setPresentCollaborators(prev => {
                            const newMap = new Map(prev)
                            newMap.set(userPayload.user.id, userPayload.user)
                            return newMap
                        })
                    }
                    else if(updateDTO.type == ShotlistUpdateType.USER_LEFT){
                        setPresentCollaborators(prev => {
                            const newMap = new Map(prev)
                            newMap.forEach(user => {
                                if(user.id == userPayload.user.id)
                                    newMap.delete(user.id)
                            })
                            return newMap
                        })
                    }

                    break
                case "collaboration":
                    switch (updateDTO.type){
                        case ShotlistUpdateType.COLLABORATION_TYPE_UPDATED:
                            //a collaboration type changed (we are only interested in possible changes to our own collaboration types)
                            syncService.current.collaboratorTypeChanged(
                                updateDTO.payload as CollaborationPayload,
                                setQuery
                            )
                            break
                        case ShotlistUpdateType.COLLABORATION_DELETED:
                            if(currentUserRef.current?.id == updateDTO.payload.userId){
                                setQuery({
                                    ...query,
                                    errors: [{
                                        message: "Your collaboration to this shotlist has been removed",
                                        extensions: { code: ShotlyErrorCode.READ_NOT_ALLOWED }
                                    }]
                                })
                            }
                            break
                    }
                    break
                case "presentCollaborators":
                    const collabMap = new Map<string, UserMinimalDTO>()
                    updateDTO.payload.collaborators.forEach(user => collabMap.set(user.id, user))
                    setPresentCollaborators(collabMap)
                    break
                case "sceneAttribute":
                    syncService.current.updateSceneAttribute(updateDTO.payload, sidebarRef.current)
                    break
                case "scene":
                    switch (updateDTO.type) {
                        case ShotlistUpdateType.SCENE_ADDED:
                            syncService.current.createScene(updateDTO.payload, sidebarRef.current)
                            break
                        case ShotlistUpdateType.SCENE_DELETED:
                            syncService.current.deleteScene(updateDTO.payload, sidebarRef.current)
                            break
                        case ShotlistUpdateType.SCENE_UPDATED:
                            syncService.current.updateScene(updateDTO.payload, sidebarRef.current)
                            break
                    }
                    break
                case "sceneAttributeOption":
                    syncService.current.sceneAttributeOptionCreated(updateDTO.payload, shotlistContextFunctionsRef.current.addSceneSelectOption)
                    break
                case "shotAttributeOption":
                    syncService.current.shotAttributeOptionCreated(updateDTO.payload, shotlistContextFunctionsRef.current.addShotSelectOption)
                    break
                case "selectedCell":
                    syncService.current.setCollaboratorCellHighlight(updateDTO, selectedSceneRef.current, sheetManagerRef.current)
                    break
                case "selectedSceneAttribute":
                    syncService.current.setCollaboratorSceneAttributeHighlight(updateDTO, selectedSceneRef.current, sidebarRef.current)
                case "empty":
                    switch (updateDTO.type) {
                        case ShotlistUpdateType.SHOTLIST_OPTIONS_UPDATED:
                            refreshShotlistFunction.current()
                            break
                    }
                    break
            }
        }

        websocket.onclose = (event) => {
            console.info('Disconnected from WebSocket server')

            if (event.code !== 1000) {
                reconnectWebsocket()
            }
        }

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
    }

    const reconnectWebsocket = () => {
        // Don't reconnect if we don't have a user yet
        if (!currentUserRef.current?.id || !query?.data?.shotlist?.id) {
            console.info("Skipping reconnect - not loaded yet");
            return;
        }

        if (websocketRef.current?.readyState === WebSocket.OPEN || websocketRef.current?.readyState === WebSocket.CONNECTING) {
            console.info("Skipping reconnect - already connected");
            return;
        }

        const delay = Math.min(1000 * 2 ** websocketRetriesRef.current, 30000);

        setTimeout(() => {
            websocketRetriesRef.current++;
            console.info("Attempting reconnect, attempt", websocketRetriesRef.current, "with user id", currentUserRef.current?.id);
            if(currentUserRef.current?.id)
                joinShotlistWebsocket(currentUserRef.current?.id);
        }, delay);
    }

    const loadShotSelectOptions = async (shotAttributeDefinitionId: number) => {
        //options are already in the cache
        if(shotSelectOptionsCache.has(shotAttributeDefinitionId)) return

        const {data} = await client.query({
            query: gql`
                query getShotSelectAttributeOptions($definitionId: BigInteger!) {
                    shotSelectAttributeOptions(
                        attributeDefinitionId: $definitionId
                    ) {
                        id
                        name
                    }
                }
            `,
            variables: {definitionId: shotAttributeDefinitionId},
            fetchPolicy: 'no-cache'
        })

        let newCache = new Map(shotSelectOptionsCache)

        newCache.set(
            shotAttributeDefinitionId,
            data.shotSelectAttributeOptions.map((option: any): SelectOption => ({
                value: option.id,
                label: option.name,
            }))
        )

        setShotSelectOptionsCache(newCache)

        return Promise.resolve()
    }

    const addShotSelectOption = async (shotAttributeDefinitionId: number, option: SelectOption) => {
        const currentOptions = shotSelectOptionsCache.get(shotAttributeDefinitionId) || []
        const newCache = new Map(shotSelectOptionsCache)
        newCache.set(shotAttributeDefinitionId, [...currentOptions, option])
        setShotSelectOptionsCache(newCache)
    }

    const loadSceneSelectOptions = async (sceneAttributeDefinitionId: number) => {
        //options are already in the cache
        if(sceneSelectOptionsCache.has(sceneAttributeDefinitionId)) return

        const {data} = await client.query({
            query: gql`
                query getSceneSelectAttributeOptions($definitionId: BigInteger!) {
                    sceneSelectAttributeOptions(
                        attributeDefinitionId: $definitionId
                    ) {
                        id
                        name
                    }
                }
            `,
            variables: {definitionId: sceneAttributeDefinitionId},
            fetchPolicy: 'no-cache'
        })

        let newCache = new Map(sceneSelectOptionsCache)

        newCache.set(
            sceneAttributeDefinitionId,
            data.sceneSelectAttributeOptions.map((option: any): SelectOption => ({
                value: option.id,
                label: option.name,
            }))
        )

        setSceneSelectOptionsCache(newCache)

        return Promise.resolve()
    }

    const addSceneSelectOption = async (sceneAttributeDefinitionId: number, option: SelectOption) => {
        const currentOptions = sceneSelectOptionsCache.get(sceneAttributeDefinitionId) || []
        const newCache = new Map(sceneSelectOptionsCache)
        newCache.set(sceneAttributeDefinitionId, [...currentOptions, option])
        setSceneSelectOptionsCache(newCache)
    }

    const calculateReadOnlyState = () => {
        let newState: ReadOnlyState = {isReadOnly: false}

        //users in basic mode are only allowed to have one single shotlist
        if (
            query.data.shotlist &&
            query.data.shotlist.owner &&
            query.data.shotlist.owner.tier == UserTier.Basic &&
            (
                !query.data.shotlist.owner.shotlistCount ||
                query.data.shotlist.owner.shotlistCount > 1
            )
        ) {
            newState = {
                isReadOnly: true,
                reason: "tooManyShotlists"
            }
        }

        //the current user only has view access to the shotlist
        (query.data.shotlist?.collaborations as CollaborationDto[])?.forEach((collab: CollaborationDto) => {
            if(collab?.user?.id == query.data.currentUser?.id && collab.collaborationType == CollaborationType.View) {
                newState = {
                    isReadOnly: true,
                    reason: "collaborationViewOnly"
                }
            }
        })

        if(newState.isReadOnly != readOnlyState.isReadOnly) {
            setReadOnlyState(newState)
        }
    }

    const selectScene = (id: string | null, position: number | null) => {
        setSelectedScene({
            id: id,
            position: position,
        })

        const url = new URL(window.location.href)
        url.searchParams.set("sid", id || "")
        router.push(url.toString())
    }

    const openShotlistOptionsDialog = (page: { main: ShotlistOptionsDialogPage, sub?: ShotlistOptionsDialogSubPage }) => {
        setSelectedOptionsDialogPage({main: page.main, sub: page.sub || ShotlistOptionsDialogSubPage.shot})
        setOptionsDialogOpen(true)
    }

    //used in the socket handler
    //has to be at the bottom because the functions have to be initialized before being used in the context value
    const shotlistContextFunctionsRef = useRef({
        addShotSelectOption,
        addSceneSelectOption
    })

    if(!auth.getUser())
        return <LoadingPage title={Config.loadingMessage.authGetUser}/>

    if(query.errors && query.errors.length > 0) {
        switch (query.errors[0]?.extensions?.code as ShotlyErrorCode) {
            case ShotlyErrorCode.NOT_FOUND:
                return <ErrorPage
                    title='404'
                    description='Sorry, we could not find the Shotlist you were looking for. Please check the URL or return to the Dashboard.'
                />
            case ShotlyErrorCode.READ_NOT_ALLOWED:
                return <ErrorPage
                    title='405'
                    description='Sorry, you are not allowed to access this Shotlist. Please check the URL or return to the Dashboard.'
                />
        }
    }

    return (
        <ShotlistContext.Provider value={{
            openShotlistOptionsDialog: openShotlistOptionsDialog,
            elementIsBeingDragged: elementIsBeingDragged,
            setElementIsBeingDragged: setElementIsBeingDragged,
            shotCount: shotCount,
            setShotCount: setShotCount,
            sceneCount: sceneCount,
            setSceneCount: setSceneCount,
            focusedCell: focusedCell,
            setFocusedCell: setFocusedCell,
            shotSelectOptions: shotSelectOptionsCache,
            loadShotSelectOptions: loadShotSelectOptions,
            addShotSelectOption: addShotSelectOption,
            sceneSelectOptions: sceneSelectOptionsCache,
            loadSceneSelectOptions: loadSceneSelectOptions,
            addSceneSelectOption: addSceneSelectOption,
            websocketRef: websocketRef,
            broadCastSceneAttributeSelect: broadCastSceneAttributeSelect,
            setSaveState: setSaveState,
            handleError: handleShotlistError
        }}>
            {
                readOnlyBannerVisible && readOnlyState.isReadOnly == true &&
                <div
                    className="readOnlyBanner"
                >
                    This Shotlist is in <span className={"bold"}>read-only</span> mode because
                    {
                        readOnlyState.reason == "tooManyShotlists" ?
                        " the shotlists owner has exceeded the maximum number of Shotlist available with the basic tier" :
                        ' the shotlists owner set your collaboration type to "viewer"'
                    }.
                    <button onClick={() => setReadOnlyBannerVisible(false)}><X size={18}/></button>
                </div>
            }
            <main className={`shotlist`} key={reloadKey}>
                <PanelGroup autoSaveId={"shotly-shotlist-sidebar-width"} direction="horizontal"
                            className={"PanelGroup"}>
                    <Panel
                        defaultSize={20}
                        maxSize={30}
                        minSize={12}
                        className={`sidebar collapse ${sidebarOpen ? "open" : "closed"}`}
                    >
                        {
                            query.loading ?
                            <div style={{display: "flex", flexDirection: "column", padding: ".5rem", height: "100%"}} className={"content"}>
                                <div className={"top"}>
                                    <Link href={`../dashboard`}>
                                        <House strokeWidth={2.5} size={20}/>
                                    </Link>
                                    <Skeleton height="2rem" width={"18ch"} style={{marginLeft: ".5rem"}}/>
                                </div>
                                <Skeleton height="2rem" count={6} style={{marginBottom: ".3rem"}}/>
                            </div> :
                            <ShotlistSidebar
                                query={query}
                                setQuery={setQuery}
                                sceneCount={sceneCount}
                                setSceneCount={setSceneCount}
                                selectedScene={selectedScene}
                                selectScene={selectScene}

                                isReadOnly={readOnlyState.isReadOnly}
                                setSidebarOpen={setSidebarOpen}
                                reloadInProgress={reloadInProgress}

                                openShotlistOptionsDialog={() => {
                                    setOptionsDialogOpen(true)
                                    driverObj.destroy()
                                }}

                                presentCollaborators={Array.from(presentCollaborators?.values() || [])}

                                ref={sidebarRef}
                            />
                        }
                    </Panel>
                    <PanelResizeHandle className="PanelResizeHandle sidebarResize" hitAreaMargins={{fine: 5, coarse: 10}}/>
                    <Panel className={`content ${reloadInProgress && "reloading"}`} id={"shotTable"}>
                        <div className="header" ref={headerRef}>
                            <div className="number"><p>#</p></div>
                            {
                                query.loading ?
                                <>
                                    <Skeleton width="18vw" height="1rem" style={{marginRight: ".5rem"}}/>
                                    <Skeleton width="18vw" height="1rem" style={{marginRight: ".5rem"}}/>
                                    <Skeleton width="18vw" height="1rem" style={{marginRight: ".5rem"}}/>
                                </> :
                                !query.data.shotlist?.shotAttributeDefinitions || query.data.shotlist.shotAttributeDefinitions.length == 0 ?
                                <p className={"empty"}>No shot attributes defined</p> :
                                (query.data.shotlist.shotAttributeDefinitions as ShotAttributeDefinitionBase[]).map((attr: any, index) => (
                                    <div className={`attribute`} key={attr.id}><p>{attr.name || "Unnamed"}</p></div>
                                ))
                            }
                        </div>
                        <SheetManager
                            selectedScene={selectedScene}
                            pageLoading={query.loading}
                            shotAttributeDefinitions={query.data.shotlist?.shotAttributeDefinitions as ShotAttributeDefinitionBase[] || null}
                            isReadOnly={readOnlyState.isReadOnly}
                            shotlistHeaderRef={headerRef}
                            ref={sheetManagerRef}
                        />
                    </Panel>
                </PanelGroup>

                <div className="floater">
                    {
                        reloadInProgress &&
                        <SimpleTooltip
                            text={"The reload is triggered when either you or a collaborator make changes to the shotlist options like adding/removing attributes."}
                            fontSize={0.85}
                            offset={0}
                            delay={0}
                        >
                            <div className="reloading">
                                Shotlist is reloading<DotLoader/>
                            </div>
                        </SimpleTooltip>
                    }
                    <div className="saveIndicator" data-state="saved" ref={saveIndicatorRef} aria-hidden>
                        <span className="saving"><LoaderCircle size={18}/></span>
                        <span className="saved"><Check size={18} strokeWidth={2.5}/></span>
                        <span className="error">!</span>
                    </div>
                    <HelpLink link="https://docs.shotly.at/shotlist/navigation" delay={0}/>
                    <button className="openSidebar" onClick={() => setSidebarOpen(true)}><Menu/></button>
                </div>
            </main>
            <ShotlistOptionsDialog
                isOpen={optionsDialogOpen}
                setIsOpen={setOptionsDialogOpen}
                selectedPage={selectedOptionsDialogPage}
                shotlistId={query.data.shotlist?.id || null}
                refreshShotlist={() => {
                    refreshShotlistFunction.current()

                    const updateDTO: ShotlistUpdateDTO = {
                        type: ShotlistUpdateType.SHOTLIST_OPTIONS_UPDATED,
                        userId: query.data.currentUser?.id || "unknown",
                        timestamp: new Date(),
                        payload: {kind: "empty"}
                    }

                    //this is a super ugly fix for the potential race condition that happens when a collaborator recieves
                    //the websocket message and queries its own shotlist before the update from the first user has
                    //been processed, causing the shotlist to not be updated properly
                    setTimeout(() => {
                        websocketRef.current?.send(JSON.stringify(updateDTO))
                    },300)
                }}
                isReadOnly={readOnlyState.isReadOnly}
            ></ShotlistOptionsDialog>
        </ShotlistContext.Provider>
    )
}