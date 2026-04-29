'use client'

import gql from "graphql-tag"
import React, {useEffect, useRef, useState} from "react"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {
    CollaborationDto,
    CollaborationType,
    Query,
    SceneDto,
    ShotAttributeDefinitionBase,
    UserTier
} from "../../../../lib/graphql/generated"
import {useParams, useRouter, useSearchParams} from "next/navigation"
import './shotlist.scss'
import ErrorPage from "@/components/app/feedback/errorPage/errorPage"
import {ShotlistContext} from "@/context/ShotlistContext"
import ShotlistOptionsDialog, {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import LoadingPage from "@/components/app/feedback/loadingPage/loadingPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import auth from "@/Auth"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Utils, {uuidRegex} from "@/utility/Utils"
import Config from "@/Config"
import {GenericError, SelectOption, ShotlyErrorCode} from "@/utility/Types"
import SheetManager, {SheetManagerRef} from "@/components/app/shotlist/table/sheetManager/sheetManager"
import ShotlistSidebar, {ShotlistSidebarRef} from "@/components/app/shotlist/sidebar/shotlistSidebar/shotlistSidebar"
import {
    ShotlistUpdateDTO,
    ShotlistUpdateType,
    UserMinimalDTO,
} from "@/service/useShotlistSync"
import {errorNotification} from "@/service/NotificationService"
import {DialogRef} from "@/components/basic/dialog/dialog"
import {useShotlistSync} from "@/service/useShotlistSync"
import useShotlistKeybinds from "@/service/useShotlistKeybinds"
import ShotlistFloater, {ShotlistFloaterRef} from "@/components/app/shotlist/shotlistFloater/shotlistFloater"
import ReadOnlyBanner from "@/components/app/shotlist/readOnlyBanner/readOnlyBanner"
import ShotlistHeader from "@/components/app/shotlist/shotlistHeader/shotlistHeader"

export interface SelectedScene {
    id: string | null
    position: number | null
}

export interface ReadOnlyState {
    isReadOnly: boolean
    reason?: "tooManyShotlists" | "collaborationViewOnly" | "archived"
}

export interface PresentCollaborator {
    updatedAt: Date
    user: UserMinimalDTO
}

export type SaveState = "saved" | "saving" | "error"

export default function Shotlist() {
    const client = useApolloClient()
    const router = useRouter()
    const syncService = useRef<null>(null)
    const searchParams = useSearchParams()
    const params = useParams<{ id: string }>()

    const id = params?.id || ""
    /* TODO
    * should handle this better because currently if the scene positon is null the scene nums in the rows would be displayed wrong
    * should probably just shift the selected scene to shotcontext
    */
    const sceneId = searchParams?.get('sid')

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [selectedScene, setSelectedScene] = useState<SelectedScene>({ id: sceneId, position: null })
    const [selectedOptionsDialogPage, setSelectedOptionsDialogPage] = useState<{main: ShotlistOptionsDialogPage, sub: ShotlistOptionsDialogSubPage} | null>(null)
    const [elementIsBeingDragged, setElementIsBeingDragged] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const shotlistOptionsDialogRef = useRef<DialogRef>(null);

    const [reloadKey, setReloadKey] = useState(0)
    const [reloadInProgress, setReloadInProgress] = useState(false)

    const [readOnlyState, setReadOnlyState] = useState<ReadOnlyState>({isReadOnly: false})
    const [isArchived, setIsArchived] = useState(false)

    const [shotCount, setShotCount] = useState(0)
    const [sceneCount, setSceneCount] = useState(0)

    const [presentCollaborators, setPresentCollaborators] = useState<Map<string, PresentCollaborator>>(new Map())

    const focusedCell = useRef({row: -1, column:-1})

    const headerRef = useRef<HTMLDivElement>(null)
    const sheetManagerRef = useRef<SheetManagerRef>(null)
    const sidebarRef = useRef<ShotlistSidebarRef>(null)
    const floaterRef = useRef<ShotlistFloaterRef>(null)

    const [shotSelectOptionsCache, setShotSelectOptionsCache] = useState(new Map<number, SelectOption[]>())
    const [sceneSelectOptionsCache, setSceneSelectOptionsCache] = useState(new Map<number, SelectOption[]>())

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
        if(!auth.isAuthenticated()){
            auth.login()
            return
        }

        //validate shotlist id
        if(!uuidRegex.test(id)){
            setQuery(current => ({
                ...current,
                errors: [{
                    message: "Invalid shotlist id",
                    extensions: { code: ShotlyErrorCode.NOT_FOUND }
                }]
            }))
            return
        }

        if(!auth.getUser()) return

        //initially load data
        loadData(true)
    }, [id])

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
            selectScene(query.data.shotlist.scenes[0].id, query.data.shotlist.scenes[0]?.position || null)
        }
    }, [query])

    useEffect(() => {
        //update page name
        setTimeout(() => {
            document.title = `Shotly | ${query.data.shotlist?.name || "Shotlist"}`
        },500)
    }, [query.data.shotlist?.name]);

    useEffect(() => {
        //read only state
        calculateReadOnlyState()
    }, [isArchived, query]);

    const loadData = async (noCache: boolean = false) => {
        const result = await client.query({
            query: gql`
                query shotlist($id: String!){
                    shotlist(id: $id){
                        id
                        name
                        archived
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
                            shotCount
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

        setIsArchived(result.data.shotlist.archived == true)

        setQuery(result)

        return result
    }

    const refreshShotlist = async () => {
        setReloadInProgress(true)

        await loadData(true)

        setReloadInProgress(false)

        setShotSelectOptionsCache(new Map())
        setSceneSelectOptionsCache(new Map())

        setReloadKey(k => k + 1)
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

        floaterRef.current?.displaySaveState(newFinalState)
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

        sync.send(updateDTO)
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

        sync.send(updateDTO)
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

        //no clue why this is needed, saw a million errors once
        if(!data.shotSelectAttributeOptions) return

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

    const getShotSelectOption = (shotAttributeDefinitionId: number): SelectOption[] => {
        const result = shotSelectOptionsCache.get(shotAttributeDefinitionId)

        if(!result) {
            loadShotSelectOptions(shotAttributeDefinitionId)
            return []
        }

        return result
    }

    const loadSceneSelectOptions = async (sceneAttributeDefinitionId: number) => {
        //options are already in the cache
        if(
            sceneSelectOptionsCache.has(sceneAttributeDefinitionId) &&
            sceneSelectOptionsCache.get(sceneAttributeDefinitionId)
        ) return

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
            data.sceneSelectAttributeOptions?.map((option: any): SelectOption => ({
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

    const getSceneSelectOption = (sceneAttributeDefinitionId: number): SelectOption[] => {
        const result = sceneSelectOptionsCache.get(sceneAttributeDefinitionId)

        if(!result) {
            loadSceneSelectOptions(sceneAttributeDefinitionId)
            return []
        }

        return result
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

        if(isArchived) {
            newState = {
                isReadOnly: true,
                reason: "archived"
            }
        }

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
        router.replace(url.toString())
    }

    const openShotlistOptionsDialog = (page: { main: ShotlistOptionsDialogPage, sub?: ShotlistOptionsDialogSubPage }) => {
        setSelectedOptionsDialogPage({main: page.main, sub: page.sub || ShotlistOptionsDialogSubPage.shot})
        shotlistOptionsDialogRef.current?.open()
    }

    const sync = useShotlistSync({
        shotlistId: id,
        userId: query.data.currentUser?.id || null,
        sheetManagerRef: sheetManagerRef,
        sidebarRef: sidebarRef,
        selectedScene: selectedScene,
        setQuery: setQuery,
        setIsArchived: setIsArchived,
        setReloadInProgress: setReloadInProgress,
        presentCollaborators: presentCollaborators,
        setPresentCollaborators: setPresentCollaborators,
        addShotSelectOption: addShotSelectOption,
        addSceneSelectOption: addSceneSelectOption,
        refreshShotlist: refreshShotlist
    })

    useShotlistKeybinds({
        sheetManagerRef: sheetManagerRef,
        sidebarRef: sidebarRef,
        shotlistOptionsDialogRef: shotlistOptionsDialogRef,
        focusedCell: focusedCell,
        setSelectedScene: setSelectedScene,
    })

    if(!auth.getUser())
        return <LoadingPage/>

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
            setShotCount: (count) => {
                setShotCount(count);
                setQuery(prev => ({
                    ...prev,
                    data: {
                        ...prev.data,
                        shotlist: {
                            ...prev.data.shotlist,
                            scenes: (prev.data.shotlist?.scenes as SceneDto[])?.map(s => {
                                if (s.id === selectedScene.id) {
                                    return { ...s, shotCount: count };
                                }
                                return s;
                            }) || []
                        }
                    }
                }));
            },
            sceneCount: sceneCount,
            setSceneCount: setSceneCount,
            focusedCell: focusedCell,
            setFocusedCell: setFocusedCell,

            getShotSelectOption: getShotSelectOption,
            loadShotSelectOptions: loadShotSelectOptions,
            addShotSelectOption: addShotSelectOption,

            getSceneSelectOption: getSceneSelectOption,
            loadSceneSelectOptions: loadSceneSelectOptions,
            addSceneSelectOption: addSceneSelectOption,

            broadCastSceneAttributeSelect: broadCastSceneAttributeSelect,

            setSaveState: setSaveState,
            handleError: handleShotlistError,

            presentCollaborators: presentCollaborators
        }}>
            <ReadOnlyBanner readOnlyState={readOnlyState}/>

            <main className={`shotlist`} key={reloadKey}>
                <PanelGroup
                    autoSaveId={"shotly-shotlist-sidebar-width"}
                    direction="horizontal"
                    className={"PanelGroup"}
                >
                    <Panel
                        defaultSize={20}
                        maxSize={30}
                        minSize={12}
                        className={`sidebar collapse ${sidebarOpen ? "open" : "closed"}`}
                    >
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
                                shotlistOptionsDialogRef.current?.open()
                                driverObj.destroy()
                            }}

                            presentCollaborators={Array.from(presentCollaborators?.values().map(c => c.user) || [])}

                            refreshWebsocketConnection={() => sync.connect(true)}

                            ref={sidebarRef}
                        />
                    </Panel>

                    <PanelResizeHandle className="PanelResizeHandle sidebarResize" hitAreaMargins={{fine: 5, coarse: 10}}/>

                    <Panel className={`content ${reloadInProgress && "reloading"}`} id={"shotTable"}>
                        <ShotlistHeader
                            ref={headerRef}
                            query={query}
                            openShotlistOptionsDialog={openShotlistOptionsDialog}
                        />
                        <SheetManager
                            selectedScene={selectedScene}
                            queryIsLoading={query.loading}
                            shotAttributeDefinitions={query.data.shotlist?.shotAttributeDefinitions as ShotAttributeDefinitionBase[] || null}
                            isReadOnly={readOnlyState.isReadOnly}
                            shotlistHeaderRef={headerRef}
                            ref={sheetManagerRef}
                        />
                    </Panel>
                </PanelGroup>

                <ShotlistFloater
                    ref={floaterRef}
                    refreshShotlist={refreshShotlist}
                    reloadInProgress={reloadInProgress}
                    setSidebarOpen={setSidebarOpen}
                />
            </main>
            <ShotlistOptionsDialog
                ref={shotlistOptionsDialogRef}
                selectedPage={selectedOptionsDialogPage}
                shotlistId={id || null}
                refreshShotlist={() => {
                    refreshShotlist()

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
                        sync.send(updateDTO)
                    },300)
                }}
                isArchived={isArchived}
                setIsArchived={setIsArchived}
                isReadOnly={readOnlyState.isReadOnly}
            ></ShotlistOptionsDialog>
        </ShotlistContext.Provider>
    )
}