'use client'

import gql from "graphql-tag"
import Link from "next/link"
import {ApolloError, ApolloQueryResult, useApolloClient, useQuery, useSuspenseQuery} from "@apollo/client"
import "./layout.scss"
import React, {useEffect, useState} from "react"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import {
    ChevronDown,
    House,
    Menu,
    NotepadText,
    Blocks,
    Plus,
    User,
    Info,
    Inbox,
    Check,
    X,
    RefreshCw,
    LoaderCircle
} from "lucide-react"
import {CollaborationDto, CollaborationState, Query, ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {Collapsible, Popover, Tooltip} from "radix-ui"
import {wuGeneral} from "@yanikkendler/web-utils"
import auth from "@/Auth"
import {usePathname, useRouter} from "next/navigation"
import {useCreateShotlistDialog} from "@/components/dialogs/createShotlistDialog/createShotlistDialog"
import {useAccountDialog} from "@/components/dialogs/accountDialog/accountDialog"
import Utils from "@/util/Utils"
import Iconmark from "@/components/iconmark"
import {useCreateTemplateDialog} from "@/components/dialogs/createTemplateDialog/createTemplateDialog"
import Skeleton from "react-loading-skeleton"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import { DashboardContext } from "@/context/DashboardContext"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import Config from "@/util/Config"
import HelpLink from "@/components/helpLink/helpLink"
import Separator from "@/components/separator/separator"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"


export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const client = useApolloClient()
    const router = useRouter()
    const pathname = usePathname()

    const { openCreateShotlistDialog, CreateShotlistDialog } = useCreateShotlistDialog()
    const { openCreateTemplateDialog, CreateTemplateDialog } = useCreateTemplateDialog()
    const { openAccountDialog, AccountDialog } = useAccountDialog()

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [pendingCollaborations, setPendingCollaborations] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [collaborationReloadAllowed, setCollaborationReloadAllowed] = useState<boolean>(true)

    const [sharedShotlistsOpen, setSharedShotlistsOpen] = useState<boolean>(true)

    useEffect(() => {
        if(!auth.isAuthenticated()){
            router.replace('/')
            return
        }

        if(!auth.getUser()) return

        loadData()
        loadPendingCollaborations()
        setCollaborationReloadAllowed(true)
    }, [])

    const loadData = async () => {
        try {
            const result = await client.query({
                    query: gql`
                        query home{
                            shotlists{
                                personal {
                                    id
                                    name
                                    sceneCount
                                    shotCount
                                    editedAt
                                    owner {
                                        name
                                    }
                                }
                                shared {
                                    id
                                    name
                                    sceneCount
                                    shotCount
                                    editedAt
                                    owner {
                                        name
                                    }
                                }
                            }
                            templates {
                                id
                                name
                                shotAttributeCount
                                sceneAttributeCount
                                owner {
                                    name
                                }
                            }
                            pendingCollaborations{
                                id
                                user {
                                    id
                                    name
                                }
                                shotlist {
                                    name
                                }
                                collaborationState
                                collaborationType
                            }
                            currentUser {
                                name
                                email
                            }
                        }`,
                    fetchPolicy: "no-cache"
                },
            )

            setQuery(result)

            setSharedShotlistsOpen(result.data.shotlists?.shared && result.data.shotlists.shared.length > 0)
        }
        catch (error) {
            setQuery({...query, error: error as ApolloError})
        }
    }

    const loadPendingCollaborations = async () => {
        try {
            setCollaborationReloadAllowed(false)
            setPendingCollaborations({...query, loading: true})

            const result = await client.query({
                query: gql`
                    query pendingCollaborations{
                        pendingCollaborations{
                            id
                            owner {
                                name
                            }
                            shotlist {
                                name
                            }
                            collaborationState
                            collaborationType
                        }
                    }`,
                fetchPolicy: "no-cache"
            })

            console.log(result)

            setTimeout(()=> {
                setCollaborationReloadAllowed(true)
            }, wuConstants.Time.msPerSecond * 5)

            setPendingCollaborations(result)
        }
        catch (error) {
            //todo notify user
        }
    }

    const acceptOrDeclineCollaboration = async (collaborationId: string, newState: CollaborationState) => {
        const result = await client.mutate({
            mutation: gql`
                mutation acceptOrDeclineCollaboration($collaborationId: String!, $newState: CollaborationState!) {
                    acceptOrDeclineCollaboration(editDTO: {
                        id: $collaborationId,
                        collaborationState: $newState
                    }) {
                        id
                        user {
                            id
                            email
                            name
                        }
                        collaborationType
                        collaborationState
                    }
                }
            `,
            variables: {collaborationId: collaborationId, newState: newState},
        })
        if (result.errors) {
            //TODO notify user
            console.error(result.errors);
            return;
        }

        if(newState == CollaborationState.Accepted) {
            loadData()
        }

        let newCollaborations = query.data.pendingCollaborations?.filter(c => c?.id !== collaborationId) || []

        setPendingCollaborations({
            ...query,
            data: {
                ...query.data,
                pendingCollaborations: newCollaborations
            }
        })
    }

    if(query.error) return <ErrorPage
        title='Data could not be loaded'
        description={query.error.message}
        reload
        noLink
    />

    if(!auth.getUser())
        return <LoadingPage title={Config.loadingMessage.authGetUser}/>

    return (
        <DashboardContext.Provider value={{
            query: query,
            setQuery: setQuery,
            pendingCollaborations: pendingCollaborations,
            setPendingCollaborations: setPendingCollaborations
        }}>
        <main className="home">
            <PanelGroup autoSaveId={"shotly-dashboard-sidebar-width"} direction="horizontal" className={"PanelGroup"}>
                <Panel
                    defaultSize={20}
                    maxSize={30}
                    minSize={12}
                    className={`sidebar ${pathname?.includes("template") ? "collapse" : ""} ${sidebarOpen ? "open" : "closed"}`}
                >
                    <div className="content">
                        <div className="top">
                            <SimpleTooltip
                                content={<p><span className="bold">Click</span> to go back to the Dashboard</p>}
                            >
                                <Link href={`/dashboard`} onClick={e => {
                                    wuGeneral.onNthClick(() => {
                                        window.open("https://orteil.dashnet.org/cookieclicker", '_blank')?.focus()
                                    }, e.nativeEvent, 10)
                                }}>
                                    <House strokeWidth={2.5} size={20}/>
                                </Link>
                            </SimpleTooltip>
                            <p>/</p>
                            <h1>Dashboard</h1>
                        </div>
                        <div className="list">
                            <Collapsible.Root className={"CollapsibleRoot dashboardSidebar"} id={"yourShotlists"}
                                              defaultOpen={true}>
                                <Collapsible.Trigger className={"noClickFx"}>
                                    My Shotlists <ChevronDown size={18} className={"chevron"}/>
                                </Collapsible.Trigger>
                                <Collapsible.Content
                                    className="CollapsibleContent dashboardSidebar"
                                >
                                    {
                                        query.loading ? <>
                                            <Skeleton height={"1.5rem"}/>
                                            <Skeleton height={"1.5rem"}/>
                                        </> :
                                        !query.data.shotlists?.personal || query.data.shotlists.personal.length === 0 ? (
                                            <button onClick={openCreateShotlistDialog} className={"create"}>
                                                Create new <Plus size={16}/>
                                            </button>
                                        ) :
                                        (query.data.shotlists.personal as ShotlistDto[]).sort(Utils.orderShotlistsOrTemplatesByName).map((shotlist) => (
                                            <SimpleTooltip text={shotlist.name || "Unnamed"} key={shotlist.id}>
                                                <Link href={`/shotlist/${shotlist.id}`}>
                                                    <NotepadText size={18}/>
                                                    {shotlist.name ? <span className={"truncate"}>{shotlist.name}</span> : (
                                                        <span className={"italic"}>Unnamed</span>)}
                                                </Link>
                                            </SimpleTooltip>
                                        ))
                                    }
                                </Collapsible.Content>
                            </Collapsible.Root>

                            <Collapsible.Root
                                className={"CollapsibleRoot dashboardSidebar"}
                                open={sharedShotlistsOpen}
                                onOpenChange={setSharedShotlistsOpen}
                                defaultOpen={true}
                            >
                                <Collapsible.Trigger className={"noClickFx"}>
                                    Shared Shotlists <ChevronDown size={18} className={"chevron"}/>
                                </Collapsible.Trigger>
                                <Collapsible.Content
                                    className="CollapsibleContent dashboardSidebar"
                                >
                                    {
                                        query.loading ? <>
                                            <Skeleton height={"1.5rem"}/>
                                            <Skeleton height={"1.5rem"}/>
                                        </> :
                                        !query.data.shotlists?.shared || query.data.shotlists.shared.length <= 0 ? (
                                            <p className={"empty"}>No shared shotlist yet</p>
                                        ) :
                                        (query.data.shotlists.shared as ShotlistDto[]).sort(Utils.orderShotlistsOrTemplatesByName).map((shotlist) => (
                                            <SimpleTooltip text={shotlist.name || "Unnamed"} key={shotlist.id}>
                                                <Link href={`/shotlist/${shotlist.id}`}>
                                                    <NotepadText size={18}/>
                                                    {shotlist.name ? <span className={"truncate"}>{shotlist.name}</span> : (
                                                        <span className={"italic"}>Unnamed</span>)}
                                                </Link>
                                            </SimpleTooltip>
                                        ))
                                    }
                                </Collapsible.Content>
                            </Collapsible.Root>

                            <Separator/>

                            <Collapsible.Root className={"CollapsibleRoot dashboardSidebar"} defaultOpen={true}>
                                <Collapsible.Trigger className={"noClickFx"}>
                                    My Templates <ChevronDown size={18} className={"chevron"}/>
                                </Collapsible.Trigger>
                                <Collapsible.Content
                                    className="CollapsibleContent dashboardSidebar"
                                >
                                    {
                                        query.loading ? <>
                                            <Skeleton height={"1.5rem"}/>
                                            <Skeleton height={"1.5rem"}/>
                                        </> :
                                        !query.data.templates || query.data.templates.length === 0 ? (
                                            <p className="empty">Nothing here yet</p>
                                        ) :
                                        (query.data.templates as TemplateDto[]).sort(Utils.orderShotlistsOrTemplatesByName).map((template) => (
                                            <SimpleTooltip text={template.name || "Unnamed"} key={template.id}>
                                                <Link href={`/dashboard/template/${template.id}`}
                                                      className={"template"}>
                                                    <Blocks size={18}/>
                                                    {template.name ? <span className={"truncate"}>{template.name}</span> : (
                                                        <span className={"italic"}>Unnamed</span>)}
                                                </Link>
                                            </SimpleTooltip>
                                        ))
                                    }
                                </Collapsible.Content>
                            </Collapsible.Root>
                            {/*<Collapsible.Root className={"CollapsibleRoot dashboardSidebar"} defaultOpen={false}>
                                <Collapsible.Trigger className={"noClickFx"}>
                                    Shared Templates <ChevronDown size={18} className={"chevron"}/>
                                </Collapsible.Trigger>
                                <Collapsible.Content
                                    className="CollapsibleContent dashboardSidebar"
                                >
                                    <p className={"empty"}>work in progress</p>
                                </Collapsible.Content>
                            </Collapsible.Root>*/}

                            <div className="bottom">
                                {/*only visible on mobile (via CSS)*/}
                                <button className="shotlist new accent" onClick={openCreateShotlistDialog}>
                                    New Shotlist <NotepadText size={18}/>
                                </button>
                                <button className="template new accent" onClick={openCreateTemplateDialog}>
                                    New Template <Blocks size={18}/>
                                </button>
                                {/*always visible*/}
                                <Popover.Root>
                                    <Popover.Trigger className={"collaborationRequestsTrigger"}>
                                        Collab-Requests
                                        <Inbox size={18}/>
                                        {
                                            pendingCollaborations.data.pendingCollaborations && pendingCollaborations.data.pendingCollaborations.length > 0 &&
                                            <span className={"badge"}>{pendingCollaborations.data.pendingCollaborations.length}</span>
                                        }
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content
                                            className={"popoverContent CollaborationRequests"}
                                            side={"top"}
                                            align={"start"}
                                            onOpenAutoFocus={e => e.preventDefault()}
                                        >
                                            {
                                                pendingCollaborations.loading ? <>
                                                    <Skeleton height={"2rem"}/>
                                                </> :
                                                pendingCollaborations.data.pendingCollaborations && pendingCollaborations.data.pendingCollaborations.length <= 0 ?
                                                <p className={"empty"}>No open collaboration requests</p> :
                                                (pendingCollaborations.data.pendingCollaborations as CollaborationDto[])?.map((collab) => (
                                                    <div key={collab.id} className={"collaborationRequest"}>
                                                        <p>
                                                            <span className={"bold"}>{collab.owner?.name}</span> has invited you to the shotlist <span className={"bold"}>{collab.shotlist?.name || "Unnamed"}</span>
                                                        </p>
                                                        <SimpleTooltip text="Accept collaboration">
                                                            <button
                                                                className={"accent"}
                                                                onClick={() => acceptOrDeclineCollaboration(collab.id || "", CollaborationState.Accepted)}
                                                            >
                                                                <Check size={16} strokeWidth={2.5}/>
                                                            </button>
                                                        </SimpleTooltip>
                                                        <SimpleTooltip text="Decline collaboration">
                                                            <button
                                                                className={"accent"}
                                                                onClick={() => acceptOrDeclineCollaboration(collab.id || "", CollaborationState.Declined)}
                                                            >
                                                                <X size={16} strokeWidth={2.5}/>
                                                            </button>
                                                        </SimpleTooltip>
                                                    </div>
                                                ))
                                            }

                                            <button
                                                className={"reload"}
                                                onClick={loadPendingCollaborations}
                                                disabled={!collaborationReloadAllowed}
                                            >
                                                <RefreshCw size={16}/>
                                                {
                                                    collaborationReloadAllowed ?
                                                    "refresh" :
                                                    "please wait a few seconds..."
                                                }
                                            </button>
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                                <button onClick={openAccountDialog}>Account <User size={18}/></button>
                            </div>
                        </div>
                    </div>
                    <div className="bottom">
                        <Link className="shotlistTool" href={"/"}><Iconmark/>shotly.at</Link>
                    </div>
                    <button className="closearea" onClick={() => setSidebarOpen(false)}/>
                </Panel>
                <PanelResizeHandle className="PanelResizeHandle sidebarResize"/>
                <Panel className={`headerContainer ${pathname?.includes("template") ? "template" : ""}`}>
                    <div className="header">
                        {
                            query.loading ?
                            <>
                                <Skeleton height="2rem" width="12ch"/>
                                <Skeleton height="2rem" width="12ch"/>
                            </>
                            :
                            <>
                                <button className="template" onClick={openCreateTemplateDialog}>New Template</button>
                                <button className="shotlist" onClick={openCreateShotlistDialog}>New Shotlist</button>
                            </>
                        }
                    </div>
                    {children}
                </Panel>
            </PanelGroup>

            <div className="floater">
                {
                    /*Yeah i know this is ugly*/
                    pathname?.includes("template") && <>
                        <HelpLink link="https://docs.shotly.at/templates"/>
                        <button className="openSidebar" onClick={() => setSidebarOpen(true)}><Menu/></button>
                    </>
                }
            </div>

            {CreateShotlistDialog}
            {CreateTemplateDialog}
            {AccountDialog}
        </main>
        </DashboardContext.Provider>
    );
}
