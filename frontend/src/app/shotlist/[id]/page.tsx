'use client'

import gql from "graphql-tag"
import React, {useEffect, useRef, useState} from "react"
import {ApolloError, ApolloQueryResult, InteropApolloQueryResult, useApolloClient} from "@apollo/client"
import {
    CollaborationDto,
    CollaborationType,
    Query,
    ShotAttributeDefinitionBase,
    UserTier
} from "../../../../lib/graphql/generated"
import {useParams, useRouter, useSearchParams} from "next/navigation"
import {Menu, X} from "lucide-react"
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
import Utils, {Config} from "@/util/Utils"
import {SelectOption} from "@/util/Types"
import SheetManager, {SheetManagerRef} from "@/components/shotlist/spreadsheet/sheetManager/sheetManager"
import ShotlistSidebar, {ShotlistSidebarRef} from "@/components/shotlist/shotlistSidebar/shotlistSidebar"
import Skeleton from "react-loading-skeleton"
import {
    CollaborationPayload,
    ShotlistSyncService,
    ShotlistUpdateDTO,
    ShotlistUpdateType,
    UserMinimalDTO,
    UserPayload
} from "@/service/ShotlistSyncService"

export interface SelectedScene {
    id: string | null
    position: number | null
}

export interface ReadOnlyState {
    isReadOnly: boolean
    reason?: "tooManyShotlists" | "collaborationViewOnly"
}

export default function Shotlist() {
    const client = useApolloClient()
    const router = useRouter()

    const params = useParams<{ id: string }>()
    const id = params?.id || ""
    const searchParams = useSearchParams()
    /* TODO
    * should handle this better because currently the scene positon is null so the scene nums in the rows would be displayed wrong
    * should probably just shfit the selected scene to shotcontext
    */
    const sceneId = searchParams?.get('sid')

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    const [selectedScene, setSelectedScene] = useState<SelectedScene>({ id: sceneId, position: null })
    const selectedSceneRef = useRef<SelectedScene>(selectedScene)
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false)
    const [selectedOptionsDialogPage, setSelectedOptionsDialogPage] = useState<{main: ShotlistOptionsDialogPage, sub: ShotlistOptionsDialogSubPage}>({main: "general", sub: "shot"})
    const [elementIsBeingDragged, setElementIsBeingDragged] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)

    const [readOnlyState, setReadOnlyState] = useState<ReadOnlyState>({isReadOnly: false})

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [shotCount, setShotCount] = useState(0)
    const [sceneCount, setSceneCount] = useState(0)

    const [readOnlyBannerVisible, setReadOnlyBannerVisible] = useState(true)
    const [presentCollaborators, setPresentCollaborators] = useState<Set<UserMinimalDTO>>()

    const focusedCell = useRef({row: -1, column:-1})
    const headerRef = useRef<HTMLDivElement>(null)
    const sheetManagerRef = useRef<SheetManagerRef>(null)
    const sidebarRef = useRef<ShotlistSidebarRef>(null);

    const shotSelectOptionsCache = useRef(new Map<number, SelectOption[]>())
    const websocketRef = useRef<WebSocket | null>(null)

    const syncService = useRef<ShotlistSyncService | null>(null)

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
        const url = new URL(window.location.href)
        if(url.searchParams.get("oo") == "true") {
            let currentOptionsMainPage = url.searchParams.get("mp")
            let currentOptionsSubPage = url.searchParams.get("sp")

            if(!currentOptionsMainPage || currentOptionsMainPage == "") currentOptionsMainPage = "general"
            if(!currentOptionsSubPage || currentOptionsSubPage == "") currentOptionsSubPage = "shot"

            openShotlistOptionsDialog({
                main: currentOptionsMainPage as ShotlistOptionsDialogPage,
                sub: currentOptionsSubPage as ShotlistOptionsDialogSubPage
            })
        }
    }, [])

    useEffect(() => {
        if(!auth.isAuthenticated()){
            router.replace('/')
            return
        }

        if(!auth.getUser()) return

        loadData(true).then((query: InteropApolloQueryResult<Query> | undefined) => {
            //use user from the promise as to not run into react state race conditions
            joinShotlistWebsocket(query?.data.currentUser?.id || "unknown")
        })

        syncService.current = new ShotlistSyncService(id)

        return () => {
            websocketRef.current?.close()
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
    }, [query])

    useEffect(() => {
        selectedSceneRef.current = selectedScene
    }, [selectedScene]);

    const joinShotlistWebsocket = (currentUserId: string) => {
        websocketRef.current?.close()

        const websocket = new WebSocket(`ws://localhost:8080/shotlist/${id}/${currentUserId}`)

        websocket.onopen = () => console.log('Connected to WebSocket server')
        websocket.onmessage = (message) => {
            let updateDTO = JSON.parse(message.data) as ShotlistUpdateDTO

            if(!updateDTO) {
                //TODO notify user
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
                            const newSet = new Set(prev)
                            newSet.add(userPayload.user)
                            return newSet
                        })
                    }
                    else if(updateDTO.type == ShotlistUpdateType.USER_LEFT){
                        setPresentCollaborators(prev => {
                            const newSet = new Set(prev)
                            newSet.forEach(user => {
                                if(user.id == userPayload.user.id)
                                    newSet.delete(user)
                            })
                            return newSet
                        })
                    }

                    break
                case "collaboration":
                    const collabPayload = updateDTO.payload as CollaborationPayload

                    setQuery(prev => {
                        if (!prev.data?.shotlist) return prev

                        return {
                            ...prev,
                            data: {
                                ...prev.data,
                                shotlist: {
                                    ...prev.data.shotlist,
                                    collaborations: prev.data.shotlist.collaborations?.map(collab => {
                                            if(collab?.user?.id === collabPayload.userId)
                                                return {...collab, collaborationType: collabPayload.type}
                                            else
                                                return collab
                                        }
                                    )
                                }
                            }
                        }
                    })
                    break
                case "presentCollaborators":
                    console.log("present collaborators", updateDTO.payload.collaborators)
                    setPresentCollaborators(new Set(updateDTO.payload.collaborators))
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
            }
        }
        websocket.onclose = () => console.log('Disconnected from WebSocket server')

        websocketRef.current = websocket
    }

    const getShotSelectOptions = async (shotAttributeDefinitionId: number): Promise<SelectOption[]> => {
        //requested options are not in the cache
        if(!shotSelectOptionsCache.current.has(shotAttributeDefinitionId)) {
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

            shotSelectOptionsCache.current.set(
                shotAttributeDefinitionId,
                data.shotSelectAttributeOptions.map((option: any): SelectOption => ({
                    value: option.id,
                    label: option.name,
                }))
            )
        }


        return shotSelectOptionsCache.current.get(shotAttributeDefinitionId) || []
    }

    const searchShotSelectOptions = async (shotAttributeDefinitionId: number, search: string): Promise<SelectOption[]> => {
        const allOptions = await getShotSelectOptions(shotAttributeDefinitionId)
        return allOptions.filter(option => option.label.toLowerCase().includes(search.toLowerCase()))
    }

    const addShotSelectOption = async (shotAttributeDefinitionId: number, option: SelectOption) => {
        const allOptions = await getShotSelectOptions(shotAttributeDefinitionId)
        shotSelectOptionsCache.current.set(shotAttributeDefinitionId, [...allOptions, option])
    }

    const loadData = async (noCache: boolean = false) => {
        try {
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
                                    definition{id, name, position}
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
                            }
                            shotAttributeDefinitions{
                                id
                                name
                                position
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
                errorPolicy: "all",
            })

            setSceneCount(result.data.shotlist?.scenes?.length || 0)

            setQuery(result)

            return result
        }
        catch (e){
            setQuery({...query, error: e as ApolloError})
        }
    }

    const calculateReadOnlyState = () => {
        let newState: ReadOnlyState = {isReadOnly: false}

        //users in basic mode are only allowed to have one single shotlist
        if (
            query.data.shotlist &&
            query.data.shotlist.owner &&
            query.data.shotlist.owner.tier == UserTier.Basic &&
            query.data.shotlist.owner.shotlistCount > 1
        ) {
            newState = {
                isReadOnly: true,
                reason: "tooManyShotlists"
            }
        }

        //the current user only has view access to the shotlist
        (query.data.shotlist?.collaborations as CollaborationDto[]).forEach((collab: CollaborationDto) => {
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

        console.log("now selected", id, position)

        const url = new URL(window.location.href)
        url.searchParams.set("sid", id || "")
        router.push(url.toString())
    }

    const openShotlistOptionsDialog = (page: { main: ShotlistOptionsDialogPage, sub?: ShotlistOptionsDialogSubPage }) => {
        setSelectedOptionsDialogPage({main: page.main, sub: page.sub || "shot"})
        setOptionsDialogOpen(true)
    }

    if(query.error) return <ErrorPage
        title='Data could not be loaded'
        description={query.error.message}
        link={{
            text: 'Dashboard',
            href: '/dashboard'
        }}
    />

    if(!auth.getUser()) return <LoadingPage title={"loading shotlist..."}/>

    if(!query.loading && !query.data.shotlist) return <ErrorPage
        title='404'
        description='Sorry, we could not find the shotlist you were looking for. Please check the URL or return to the dashboard.'
        link={{
            text: 'Dashboard',
            href: '/dashboard'
        }}
    />

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
            getShotSelectOptions: getShotSelectOptions,
            searchShotSelectOptions: searchShotSelectOptions,
            addShotSelectOption: addShotSelectOption
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
            <main className="shotlist" key={reloadKey}>
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
                            <div style={{display: "flex", flexDirection: "column", padding: ".5rem", height: "100%"}}>
                                <Skeleton height="2rem" style={{marginBottom: "1rem"}}/>
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

                                openShotlistOptionsDialog={() => {
                                    setOptionsDialogOpen(true)
                                    driverObj.destroy()
                                }}

                                presentCollaborators={presentCollaborators}

                                ref={sidebarRef}
                            />
                        }
                    </Panel>
                    <PanelResizeHandle className="PanelResizeHandle sidebarResize" hitAreaMargins={{fine: 5, coarse: 10}}/>
                    <Panel className="content" id={"shotTable"}>
                        <div className="header" ref={headerRef}>
                            <div className="number"><p>#</p></div>
                            {
                                query.loading ?
                                <>
                                    <Skeleton width="18vw" height="1rem"/>
                                    <Skeleton width="18vw" height="1rem"/>
                                    <Skeleton width="18vw" height="1rem"/>
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
                            shotAttributeDefinitions={query.data.shotlist?.shotAttributeDefinitions as ShotAttributeDefinitionBase[] || null}
                            isReadOnly={readOnlyState.isReadOnly}
                            shotlistHeaderRef={headerRef}
                            ref={sheetManagerRef}
                        />
                    </Panel>
                </PanelGroup>
                <button className="openSidebar" onClick={() => setSidebarOpen(true)}><Menu/></button>
            </main>
            <ShotlistOptionsDialog
                isOpen={optionsDialogOpen}
                setIsOpen={setOptionsDialogOpen}
                selectedPage={selectedOptionsDialogPage}
                shotlistId={query.data.shotlist?.id || null}
                refreshShotlist={() => {
                    loadData(true).then(() => {
                        setReloadKey(reloadKey + 1)
                    })
                    shotSelectOptionsCache.current.clear()
                }}
                isReadOnly={readOnlyState.isReadOnly}
            ></ShotlistOptionsDialog>
        </ShotlistContext.Provider>
    )
}