'use client'

import gql from "graphql-tag"
import React, {useEffect, useRef, useState} from "react"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {
    CollaborationType,
    Query,
    SceneDto,
    ShotAttributeDefinitionBase,
    UserMinimalDto,
    UserTier
} from "../../../../lib/graphql/generated"
import {useParams, useRouter, useSearchParams} from "next/navigation"
import './shotlist.scss'
import ErrorPage from "@/components/app/feedback/errorPage/errorPage"
import {ShotlistContext} from "@/context/ShotlistContext"
import ShotlistOptionsDialog, {
    ShotlistOptionsDialogPages,
    ShotlistOptionsDialogRef,
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import LoadingPage from "@/components/app/feedback/loadingPage/loadingPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import auth from "@/Auth"
import Utils, {uuidRegex} from "@/utility/Utils"
import Config from "@/Config"
import {GenericError, RowColumn, SelectOption, ShotlyErrorCode} from "@/utility/Types"
import SheetManager, {SheetManagerRef} from "@/components/app/shotlist/table/sheetManager/sheetManager"
import {SceneListRef} from "@/components/app/shotlist/sidebar/sceneList/sceneList"
import {errorNotification} from "@/service/NotificationService"
import {useShotlistSync} from "@/service/useShotlistSync"
import useShotlistKeybinds from "@/service/useShotlistKeybinds"
import ShotlistFloater, {ShotlistFloaterRef} from "@/components/app/shotlist/shotlistFloater/shotlistFloater"
import ReadOnlyBanner from "@/components/app/shotlist/readOnlyBanner/readOnlyBanner"
import ShotlistHeader from "@/components/app/shotlist/shotlistHeader/shotlistHeader"
import useIntro from "@/service/useIntro"
import ShotlistSidebar from "@/components/app/shotlist/sidebar/shotlistSidebar/shotlistSidebar"

export interface SelectedScene {
    id: string | null
    position: number | null
}

export type ReadOnlyReason = "tooManyShotlists" | "collaborationViewOnly" | "collaborationCommentOnly" | "archived" | null

export interface PresentCollaborator {
    updatedAt: Date
    user: UserMinimalDto
}

export type SaveState = "saved" | "saving" | "error"

/* TODO move this all into /dashboard and setup redirect */
export default function Shotlist() {
    const client = useApolloClient()
    const router = useRouter()
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
    const [elementIsBeingDragged, setElementIsBeingDragged] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const shotlistOptionsDialogRef = useRef<ShotlistOptionsDialogRef>(null);

    const [reloadKey, setReloadKey] = useState(0)
    const [reloadInProgress, setReloadInProgress] = useState(false)

    const [currentCollaborationType, setCurrentCollaborationType] = useState<CollaborationType | null>(null)
    const [readOnlyReason, setReadOnlyReason] = useState<ReadOnlyReason>(null)
    const [isArchived, setIsArchived] = useState(false)

    const [shotCount, setShotCount] = useState(0)
    const [sceneCount, setSceneCount] = useState(0)

    /* TODO invalidate collaborators if they have been inactive for more than 60 seconds or whatever */
    const [presentCollaborators, setPresentCollaborators] = useState<Map<string, PresentCollaborator>>(new Map())

    const focusedCell = useRef<RowColumn>({row: -1, column:-1})
    const focusedSceneAttributeId = useRef(-1)

    const shotlistElementRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null)
    const sheetManagerRef = useRef<SheetManagerRef>(null)
    const sidebarRef = useRef<SceneListRef>(null)
    const floaterRef = useRef<ShotlistFloaterRef>(null)

    const [shotSelectOptionsCache, setShotSelectOptionsCache] = useState(new Map<number, SelectOption[]>())
    const [sceneSelectOptionsCache, setSceneSelectOptionsCache] = useState(new Map<number, SelectOption[]>())

    const saveStateMap = useRef<Map<string, SaveState>>(new Map())

    //TODO redo this with a global system in an "appContext" once shotlist is moved to /dashboard/shotlist
    const blockKeyBindsMap = useRef(new Map<string, string[]>())

    const intro = useIntro({
        steps: [
            { popover: { title: 'Your first Shotlist', description: 'This is where the fun beginns!' } },
            { element: '#sceneList', popover: { title: 'Scenes', description: 'Every scene has the same attributes(like location, time, actors etc.) which are defined via the shotlist options.', side: "right", align: 'center' }},
            { element: '#shotTable', popover: { title: 'Shots', description: 'Here you see all the shots of the currently selected scene. Each shot has a few attributes which are defined via the shotlist options.', side: "over", align: 'center' }},
            { element: '#shotlistOptions', popover: { title: 'Shotlist Options', description: 'Click here to open the shotlist options menu.', side: "top", align: 'center' }},
        ],
        telemetryLocation: "Shotlist"
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
                intro.show()
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
            setSelectedScene({
                id: query.data.shotlist.scenes[0].id,
                position: query.data.shotlist.scenes[0]?.position || null
            })
        }
    }, [query])

    useEffect(() => {
        //update page name
        setTimeout(() => {
            document.title = `Shotly | ${query.data.shotlist?.name || "Shotlist"}`
        },500)
    }, [query.data.shotlist?.name])

    useEffect(() => {
        calculateAccessRights() //displays the banner and locks page if no edit rights
    }, [isArchived, query.data.shotlistCollaborationType])

    //handle scene selections
    useEffect(() => {
        sheetManagerRef.current?.showLoader()

        const url = new URL(window.location.href)
        url.searchParams.set("sid", selectedScene.id || "")
        router.replace(url.toString())
    }, [selectedScene])

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
                                }

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
                    shotlistCollaborationType(shotlistId: $id)
                    currentUser {
                        id,
                        name,
                        email
                    }
                }`,
            variables: {id: id},
            fetchPolicy: noCache ? "no-cache" : "cache-first",
        })

        if(result.errors) {
            handleError({
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

    const handleError = (error: GenericError) => {
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

        sync.syncShotlistCellSelected({
            row: row,
            column: column,
            sceneId: selectedScene.id
        })
    }

    const setFocusedSceneAttributeId = (attributeId: number) => {
        focusedSceneAttributeId.current = attributeId

        sync.syncShotlistSceneAttributeSelected({
            sceneId: selectedScene.id,
            attributeId: attributeId
        })
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

    const calculateAccessRights = () => {
        if(!query.data.shotlistCollaborationType) return

        //shotlist is archived
        if(isArchived) {
            setCurrentCollaborationType(CollaborationType.View)
            setReadOnlyReason("archived")
            return
        }

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
            setCurrentCollaborationType(CollaborationType.View)
            setReadOnlyReason("tooManyShotlists")
            return
        }

        if(query.data.shotlistCollaborationType == CollaborationType.View) {
            setReadOnlyReason("collaborationViewOnly")
        }

        if(query.data.shotlistCollaborationType == CollaborationType.Comment) {
            setReadOnlyReason("collaborationCommentOnly")
        }

        setCurrentCollaborationType(query.data.shotlistCollaborationType || CollaborationType.View)
    }

    const openShotlistOptionsDialog = (pages?: ShotlistOptionsDialogPages) => {
        if(!shotlistOptionsDialogRef.current){
            errorNotification({
                title: "Failed to open options dialog",
                autoClose: true,
                tryAgainLater: true,
            })
            return
        }

        shotlistOptionsDialogRef.current.open(pages)
    }

    const sync = useShotlistSync({
        shotlistId: id,
        currentUserId: query.data.currentUser?.id || null,
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
        openShotlistOptionsDialog: openShotlistOptionsDialog,
        focusedCell: focusedCell,
        setSelectedScene: setSelectedScene,
        blockKeyBinds: blockKeyBindsMap
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

    const isViewOrCommentOnly =
        currentCollaborationType == CollaborationType.View ||
        currentCollaborationType == CollaborationType.Comment

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

            focusedSceneAttributeId: focusedSceneAttributeId,
            setFocusedSceneAttributeId: setFocusedSceneAttributeId,

            setSaveState: setSaveState,
            handleError: handleError,

            presentCollaborators: presentCollaborators,

            currentUser: query.data.currentUser ?? null,

            blockKeyBinds: blockKeyBindsMap,

            currentCollaborationType: currentCollaborationType
        }}>
            <ReadOnlyBanner isReadOnly={isViewOrCommentOnly} readOnlyReason={readOnlyReason}/>

            <main className={`shotlist`} key={reloadKey} ref={shotlistElementRef}>
                <PanelGroup
                    autoSaveId={"shotly-shotlist-sidebar-width"}
                    direction="horizontal"
                    className={"PanelGroup"}
                >
                    <ShotlistSidebar
                        query={query}
                        setQuery={setQuery}
                        openShotlistOptionsDialog={openShotlistOptionsDialog}
                        isViewOrCommentOnly={isViewOrCommentOnly}
                        reloadInProgress={reloadInProgress}
                        sceneCount={sceneCount}
                        setSceneCount={setSceneCount}
                        selectedScene={selectedScene}
                        setSelectedScene={setSelectedScene}
                        presentCollaborators={Array.from(presentCollaborators?.values().map(c => c.user) || [])}
                        sceneListRef={sidebarRef}
                    />

                    <PanelResizeHandle className="PanelResizeHandle sidebarResize" hitAreaMargins={{fine: 5, coarse: 10}}/>

                    <Panel className={`content ${reloadInProgress && "reloading"}`} id={"shotTable"}>
                        <ShotlistHeader
                            ref={headerRef}
                            query={query}
                            openShotlistOptionsDialog={openShotlistOptionsDialog}
                        />
                        <SheetManager
                            ref={sheetManagerRef}
                            selectedScene={selectedScene}
                            queryIsLoading={query.loading}
                            shotAttributeDefinitions={query.data.shotlist?.shotAttributeDefinitions as ShotAttributeDefinitionBase[] || null}
                            isReadOnly={isViewOrCommentOnly}
                            shotlistHeaderRef={headerRef}
                            setAdditionalPadding={(needsPadding) => {
                                shotlistElementRef?.current?.style
                                    .setProperty("--sheet-additional-padding-right", needsPadding ? "1.2rem" : "0rem")
                            }}
                        />
                    </Panel>
                </PanelGroup>

                <ShotlistFloater
                    ref={floaterRef}
                    refreshShotlist={refreshShotlist}
                    restartSync={sync.restart}
                    reloadInProgress={reloadInProgress}
                    setSidebarOpen={setSidebarOpen}
                />
            </main>
            <ShotlistOptionsDialog
                ref={shotlistOptionsDialogRef}
                shotlistId={id || null}
                refreshShotlist={() => {
                    refreshShotlist()

                    sync.syncShotlistOptionsUpdated()
                }}
                isArchived={isArchived}
                setIsArchived={setIsArchived}
                isReadOnly={isViewOrCommentOnly}
            ></ShotlistOptionsDialog>
        </ShotlistContext.Provider>
    )
}