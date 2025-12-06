'use client'

import gql from "graphql-tag"
import React, {use, useEffect, useRef, useState} from "react"
import {ApolloError, ApolloQueryResult, useApolloClient} from "@apollo/client"
import {
    Query,
    SceneDto,
    ShotAttributeDefinitionBase,
    ShotlistDto
} from "../../../../lib/graphql/generated"
import { useParams, useRouter, useSearchParams} from "next/navigation"
import ShotTable, {ShotTableRef} from "@/components/legacy/shotTable/shotTable"
import {Menu} from "lucide-react"
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
import {useAccountDialog} from "@/components/dialogs/accountDialog/accountDialog"
import {wuGeneral} from "@yanikkendler/web-utils"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Utils, {Config} from "@/util/Utils"
import {SelectOption} from "@/util/Types"
import SheetManager from "@/components/shotlist/spreadsheet/sheetManager/sheetManager"
import ShotlistSidebar from "@/components/shotlist/shotlistSidebar/shotlistSidebar"
import Skeleton from "react-loading-skeleton"
import Loader from "@/components/feedback/loader/loader"

export default function Shotlist() {
    const client = useApolloClient()
    const router = useRouter()

    const params = useParams<{ id: string }>()
    const id = params?.id || ""
    const searchParams = useSearchParams()
    const sceneId = searchParams?.get('sid')

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    const [selectedSceneId, setSelectedSceneId] = useState(sceneId || null)
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false)
    const [selectedOptionsDialogPage, setSelectedOptionsDialogPage] = useState<{main: ShotlistOptionsDialogPage, sub: ShotlistOptionsDialogSubPage}>({main: "general", sub: "shot"})
    const [elementIsBeingDragged, setElementIsBeingDragged] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)
    const [isReadOnly, setIsReadOnly] = useState(false)

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [shotCount, setShotCount] = useState(0)
    const [sceneCount, setSceneCount] = useState(0)

    const focusedCell = useRef({row: -1, column:-1})
    const headerRef = useRef<HTMLDivElement>(null)

    const shotSelectOptionsCache = useRef(new Map<number, SelectOption[]>())

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

        loadData(true)
    }, [id])

    useEffect(() => {
        if(!query.loading && !query.error && query.data && query.data.shotlist && query.data.shotlist.id) {
            if(localStorage.getItem(Config.localStorageKey.shotlistTourCompleted) != "true") {
                localStorage.setItem(Config.localStorageKey.shotlistTourCompleted, "true")
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
            if (
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
        catch (e){
            setQuery({...query, error: e as ApolloError})
        }
    }

    const selectScene = (sceneId: string) => {
        setSelectedSceneId(sceneId)

        const url = new URL(window.location.href)
        url.searchParams.set("sid", sceneId)
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

    if(
        (
            selectedSceneId == "" ||
            selectedSceneId == null
        ) &&
        !query.loading &&
        query.data.shotlist &&
        query.data.shotlist.scenes &&
        query.data.shotlist.scenes[0]?.id != undefined
    ) {
        setSelectedSceneId(query.data.shotlist.scenes[0].id)
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
                                selectedSceneId={selectedSceneId}
                                setSelectedSceneId={setSelectedSceneId}

                                selectScene={selectScene}
                                isReadOnly={isReadOnly}
                                setSidebarOpen={setSidebarOpen}

                                openShotlistOptionsDialog={() => {
                                    setOptionsDialogOpen(true)
                                    driverObj.destroy()
                                }}
                            />
                        }
                    </Panel>
                    <PanelResizeHandle className="PanelResizeHandle" hitAreaMargins={{fine: 5, coarse: 10}}/>
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
                            sceneId={selectedSceneId}
                            shotAttributeDefinitions={query.data.shotlist?.shotAttributeDefinitions as ShotAttributeDefinitionBase[] || null}
                            isReadOnly={isReadOnly}
                            shotlistHeaderRef={headerRef}
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
            ></ShotlistOptionsDialog>
        </ShotlistContext.Provider>
    )
}