'use client'

import gql from "graphql-tag"
import React, {use, useEffect, useRef, useState} from "react"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import Scene from "@/components/scene/scene"
import {
    Query,
    SceneDto,
    ShotAttributeDefinitionBase,
    ShotlistDto, UserDto
} from "../../../../lib/graphql/generated"
import { useParams, useRouter, useSearchParams} from "next/navigation"
import ShotTable, {ShotTableRef} from "@/components/shotTable/shotTable"
import {FileSliders, House, Menu, Plus, User} from "lucide-react"
import Link from "next/link"
import './shotlist.scss'
import { Tooltip } from "radix-ui"
import ErrorPage from "@/pages/errorPage/errorPage"
import {ShotlistContext} from "@/context/ShotlistContext"
import ShotlistOptionsDialog, {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialog/shotlistOptionsDialog/shotlistOptionsDialoge"
import LoadingPage from "@/pages/loadingPage/loadingPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor, TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable"
import {apolloClient} from "@/ApolloWrapper"
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import auth from "@/Auth"
import {useAccountDialog} from "@/components/dialog/accountDialog/accountDialog"
import {wuGeneral} from "@yanikkendler/web-utils"
import Iconmark from "@/components/iconmark"
import {Metadata} from "next"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Utils, {Config} from "@/util/Utils"
import {ShotAttributeRef} from "@/components/shotAttribute/shotAttribute"
import SheetManager from "@/components/spreadsheet/sheetManager/sheetManager"
import {SelectOption} from "@/util/Types"
import {CellRef} from "@/components/spreadsheet/cell/cell"

export default function Shotlist() {
    const params = useParams<{ id: string }>()
    const id = params?.id || ""
    const searchParams = useSearchParams()
    const sceneId = searchParams?.get('sid')

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    const [selectedSceneId, setSelectedSceneId] = useState(sceneId || "")
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false)
    const [selectedOptionsDialogPage, setSelectedOptionsDialogPage] = useState<{main: ShotlistOptionsDialogPage, sub: ShotlistOptionsDialogSubPage}>({main: "general", sub: "shot"})
    const [elementIsBeingDragged, setElementIsBeingDragged] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)
    const [isReadOnly, setIsReadOnly] = useState(false)

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [shotCount, setShotCount] = useState(0)
    const [sceneCount, setSceneCount] = useState(0)
    const focusedCell = useRef({row: -1, column:-1})

    const shotSelectOptionsCache = useRef(new Map<number, SelectOption[]>())

    const shotTableRef = useRef<ShotTableRef>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    const client = useApolloClient()
    const router = useRouter()
    const {openAccountDialog, AccountDialog} = useAccountDialog()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                distance: 4,
            }
        })
    )

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

            setSelectedOptionsDialogPage({
                main: currentOptionsMainPage as ShotlistOptionsDialogPage,
                sub: currentOptionsSubPage as ShotlistOptionsDialogSubPage
            })
            setOptionsDialogOpen(true)
        }
    }, [])

    useEffect(() => {
        if(!auth.isAuthenticated()){
            router.replace('/')
            return
        }

        if(!auth.getUser()) return

        loadData(true)
    }, [id])

    useEffect(() => {
        if(!query.loading && !query.error && query.data && query.data.shotlist && query.data.shotlist.id) {
            if(localStorage["shotly-shotlist-tour-completed"] != "true") {
                localStorage["shotly-shotlist-tour-completed"] = "true"
                driverObj.drive()
            }
        }
    }, [query]);

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
                    }
                }`,
            variables: {id: id},
            fetchPolicy: noCache ? "no-cache" : "cache-first",
            errorPolicy: "all",
        })

        //users in basic mode are only allowed to have one single shotlist
        if(
            result.data.shotlist &&
            result.data.shotlist.owner &&
            result.data.shotlist.owner.tier == "BASIC" &&
            result.data.shotlist.owner.shotlistCount > 1
        ) {
            setIsReadOnly(true)
        }

        setSceneCount(result.data.shotlist.scenes.length || 0)

        setQuery(result)
    }

    const updateShotlistName = async (name: string) => {
        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation updateShotlist($shotlistId: String!, $name: String!) {
                    updateShotlist(editDTO: {
                        id: $shotlistId
                        name: $name
                    }){
                        id
                        name
                    }
                }
            `,
            variables: { shotlistId: id, name: name },
        });

        if (errors) {
            console.error(errors);
            return;
        }

        const newShotlist: ShotlistDto = {
            ...query.data.shotlist,
            name: data.updateShotlist.name
        }

        setQuery({
            ...query,
            data: {
                ...query.data,
                shotlist: newShotlist
            }
        })
    }

    const debounceUpdateShotlistName = wuGeneral.debounce(updateShotlistName)

    const selectScene = (sceneId: string) => {
        setSelectedSceneId(sceneId)

        const url = new URL(window.location.href)
        url.searchParams.set("sid", sceneId)
        router.push(url.toString())
    }

    const removeScene = (sceneId: string) => {
        if(!query.data.shotlist || !query.data.shotlist.scenes) return

        let currentScenes = query.data.shotlist.scenes as SceneDto[]
        let newScenes: SceneDto[] = currentScenes.filter((scene: SceneDto) => scene.id != sceneId)

        setQuery({
            ...query,
            data: {
                ...query.data,
                scenes: newScenes
            }
        })

        setSceneCount(newScenes.length)

        setSelectedSceneId("")
    }

    const createScene = async () => {
        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation createScene($shotlistId: String!) {
                    createScene(shotlistId: $shotlistId){
                        id
                        position
                        attributes{
                            id
                            definition{id, name, position}

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
                }
            `,
            variables: { shotlistId: id },
        });

        if (errors) {
            console.error(errors);
            return;
        }

        const newScenes = [...query.data.shotlist?.scenes as SceneDto[] || [], data.createScene]

        setQuery({
            ...query,
            data: {
                ...query.data,
                shotlist: {...query.data.shotlist, scenes: newScenes}
            }
        })

        setSceneCount(newScenes.length)

        selectScene(data.createScene.id)
    }

    function handleDragEnd(event: any) {
        setElementIsBeingDragged(false)

        const {active, over} = event;

        if (active.id !== over.id && query && query.data.shotlist?.scenes && query.data.shotlist.scenes.length > 0) {
            const oldIndex = query.data.shotlist.scenes!.findIndex((scene) => scene!.id === active.id);
            const newIndex = query.data.shotlist.scenes!.findIndex((scene) => scene!.id === over.id);

            moveScene(active.id, oldIndex, newIndex);
        }
    }

    const moveScene = (sceneId: string, from: number, to: number) => {
        apolloClient.mutate({
            mutation: gql`
                mutation updateScene($id: String!, $position: Int!) {
                    updateScene(editDTO:{
                        id: $id,
                        position: $position
                    }){
                        id
                        position
                    }
                }
            `,
            variables: {id: sceneId, position: to},
        })

        setQuery(() => {
            let newData = {...query.data}
            newData.scenes = arrayMove(newData.scenes || [], from, to)

            return {...query, data: newData}
        })
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

    if(query.loading) return <LoadingPage title={"loading shotlist"}/>

    if(!query.data || !query.data.shotlist) return <ErrorPage
        title='404'
        description='Sorry, we could not find the shotlist you were looking for. Please check the URL or return to the dashboard.'
        link={{
            text: 'Dashboard',
            href: '/dashboard'
        }}
    />

    if(selectedSceneId == "" && query.data.shotlist.scenes && query.data.shotlist.scenes[0]?.id != undefined)
        setSelectedSceneId(query.data.shotlist.scenes[0].id)

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
                isReadOnly &&
                <p className="readonly">This Shotlist is in <span className={"bold"}>read-only</span> mode because the shotlists owner has exceeded the maximum number of Shotlist available with the basic tier.</p>
            }
            <main className="shotlist" key={reloadKey}>
                <PanelGroup autoSaveId={"shotly-shotlist-sidebar-width"} direction="horizontal"
                            className={"PanelGroup"}>
                    <Panel defaultSize={20} maxSize={30} minSize={12} className={`sidebar collapse ${sidebarOpen ? "open" : "closed"}`}>
                        <div className="content">
                            <div className="top">
                                <Tooltip.Root>
                                    <Tooltip.Trigger className={"noPadding"} asChild>
                                        <Link href={`../dashboard`}>
                                            <House strokeWidth={2.5} size={20}/>
                                        </Link>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className={"TooltipContent"}>
                                            <Tooltip.Arrow/>
                                            <p><span className="bold">Click</span> to go back to the Dashboard</p>
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <p>/</p>
                                <input
                                    type="text"
                                    defaultValue={query.data.shotlist?.name || ""}
                                    placeholder={"shotlist name"}
                                    onInput={e => debounceUpdateShotlistName(e.currentTarget.value)}
                                    role={"heading"}
                                />
                            </div>
                            {/*TODO this absolutely should be its own component wth*/}
                            <div className="list" id="sceneList">
                                {!query.data.shotlist.scenes || query.data.shotlist.scenes.length == 0 ?
                                    <p className={"empty"}>No scenes yet :(</p> :
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                        onDragStart={() => {
                                            setElementIsBeingDragged(true)
                                        }}
                                        modifiers={[restrictToVerticalAxis]}
                                    >
                                        <SortableContext
                                            items={(query.data.shotlist?.scenes as SceneDto[]).map(scene => scene.id) as string[]}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {(query.data.shotlist?.scenes as SceneDto[]).map((scene: SceneDto, index) => (
                                                <Scene
                                                    key={scene.id}
                                                    scene={scene}
                                                    position={index}
                                                    expanded={selectedSceneId == scene.id}
                                                    onSelect={selectScene}
                                                    onDelete={removeScene}
                                                    moveScene={moveScene}
                                                    readOnly={isReadOnly}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                }
                                <button className={"create"} disabled={isReadOnly} onClick={createScene}>Add
                                    scene <Plus/></button>
                                <div className="bottom">
                                    <button onClick={() => {
                                        setOptionsDialogOpen(true)
                                        driverObj.destroy()
                                    }} id={"shotlistOptions"}>Shotlist Options <FileSliders size={18}/></button>
                                    <button onClick={openAccountDialog}>Account <User size={18}/></button>
                                </div>
                            </div>
                        </div>
                        <div className="bottom">
                            <Link className="shotlistTool" href={"/"}><Iconmark/>shotly.at</Link>
                        </div>
                        <button className="closearea" onClick={() => setSidebarOpen(false)}/>
                    </Panel>
                    <PanelResizeHandle className="PanelResizeHandle" hitAreaMargins={{fine: 3, coarse: 10}}/>
                    <Panel className="content" id={"shotTable"}>
                        <div className="header" ref={headerRef}>
                            <div className="number"><p>#</p></div>
                            {!query.data.shotlist.shotAttributeDefinitions || query.data.shotlist.shotAttributeDefinitions.length == 0 ?
                                <p className={"empty"}>No shot attributes defined</p> :
                                (query.data.shotlist.shotAttributeDefinitions as ShotAttributeDefinitionBase[]).map((attr: any, index) => (
                                    <div className={`attribute`} key={attr.id}><p>{attr.name || "Unnamed"}</p></div>
                                ))
                            }
                        </div>
                        {/*<ShotTable
                            ref={shotTableRef}
                            sceneId={selectedSceneId}
                            shotAttributeDefinitions={shotlist.data.shotAttributeDefinitions as ShotAttributeDefinitionBase[]}
                            readOnly={ isReadOnly }
                            shotlistHeaderRef={headerRef}
                        />*/}
                        <SheetManager
                            sceneId={selectedSceneId}
                            shotAttributeDefinitions={query.data.shotlist.shotAttributeDefinitions as ShotAttributeDefinitionBase[]}
                            isReadOnly={isReadOnly}
                        />
                    </Panel>
                </PanelGroup>
                <button className="openSidebar" onClick={() => setSidebarOpen(true)}><Menu/></button>
            </main>
            <ShotlistOptionsDialog
                isOpen={optionsDialogOpen}
                setIsOpen={setOptionsDialogOpen}
                selectedPage={selectedOptionsDialogPage}
                shotlistId={query.data.shotlist?.id || ""}
                refreshShotlist={() => {
                    loadData(true).then(() => {
                        setReloadKey(reloadKey + 1)
                    })
                    shotSelectOptionsCache.current.clear()
                }}
            ></ShotlistOptionsDialog>
            {AccountDialog}
        </ShotlistContext.Provider>
    )
}