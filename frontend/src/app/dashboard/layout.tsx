'use client'

import gql from "graphql-tag"
import Link from "next/link"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import "./layout.scss"
import React, {useEffect, useRef, useState} from "react"
import ErrorPage from "@/components/app/feedback/errorPage/errorPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import {
    Archive,
    Blocks,
    Check,
    ChevronDown,
    House,
    Inbox,
    Menu,
    NotepadText,
    Plus,
    RefreshCw,
    User,
    X
} from "lucide-react"
import {CollaborationDto, CollaborationState, Query, ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {Collapsible, Dialog, Popover, VisuallyHidden} from "radix-ui"
import {wuAnimate, wuGeneral} from "@yanikkendler/web-utils"
import auth from "@/Auth"
import {usePathname, useRouter} from "next/navigation"
import {useCreateShotlistDialog} from "@/components/app/dialogs/createShotlistDialog/createShotlistDialog"
import {useAccountDialog} from "@/components/app/dialogs/accountDialog/accountDialog"
import Utils from "@/utility/Utils"
import Iconmark from "@/components/logo/iconmark"
import {useCreateTemplateDialog} from "@/components/app/dialogs/createTemplateDialog/createTemplateDialog"
import Skeleton from "react-loading-skeleton"
import LoadingPage from "@/components/app/feedback/loadingPage/loadingPage"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import Config from "@/Config"
import HelpLink from "@/components/app/helpLink/helpLink"
import Separator from "@/components/basic/separator/separator"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import {errorNotification, successNotification} from "@/service/NotificationService"
import JustBoughtProDialog from "@/components/app/dialogs/justBoughtProDialog/justBoughtProDialog"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys" //package has incorrectly configured type exports
import Image from "next/image"
import DashboardHeader from "@/components/app/dashboard/dashboardHeader/dashboardHeader"
import EnterNameFloater from "@/components/app/dashboard/floaterDialogs/enterNameFloater"
import HowDidYouHearFloater from "@/components/app/dashboard/floaterDialogs/howDidYouHearFloater"
import ChangeLogFloater from "@/components/app/dashboard/floaterDialogs/changeLogFloater"
import {CHANGELOG} from "@/data/changelog"
import DashboardFloater from "@/components/app/dashboard/dashboardFloater/dashboardFloater";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const client = useApolloClient()
    const router = useRouter()
    const pathname = usePathname()

    const { openCreateShotlistDialog, CreateShotlistDialog } = useCreateShotlistDialog()
    const { openCreateTemplateDialog, CreateTemplateDialog } = useCreateTemplateDialog()
    const { openAccountDialog, AccountDialog } = useAccountDialog()

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [collaborationRequestOpen, setCollaborationRequestOpen] = useState(false)

    const [dialogStep, setDialogStep] = useState(DialogStep.LOADING)

    const [pendingCollaborations, setPendingCollaborations] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [collaborationReloadAllowed, setCollaborationReloadAllowed] = useState<boolean>(true)

    const [enterNameFloaterVisible, setEnterNameFloaterVisible] = useState(false)
    const [howDidYouHearFloaterVisible, setHowDidYouHearFloaterVisible] = useState(false)
    const [changelogFloaterVisible, setChangelogFloaterVisible] = useState(false)

    const [easterEggOpen, setEasterEggOpen] = useState(false)

    const [pagename, setPagename] = useState("Dashboard")

    const [refreshSignal, setRefreshSignal] = useState(0)

    //register keybinds
    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "Alt+N": event => {
                event.preventDefault()
                openCreateShotlistDialog()
            },
            "Alt+S": event => {
                event.preventDefault()
                openCreateShotlistDialog()
            },
            "Alt+T": event => {
                event.preventDefault()
                openCreateTemplateDialog()
            },
            "Alt+H": event => { //not alt+d because that is reserved by browsers
                event.preventDefault()
                router.push("/dashboard")
            },
            "Alt+A": event => {
                event.preventDefault()
                openAccountDialog()
            },
            "Alt+C": event => {
                event.preventDefault()
                setCollaborationRequestOpen(isOpen => !isOpen)
            },
            "S h o t l y": event => {
                setEasterEggOpen(true)
            }
        })
        return () => {
            unsubscribe()
        }
    }, [])

    //Show floater Dialogs
    useEffect(() => {
        if(!query.data.currentUser) return

        if(dialogStep != DialogStep.QUESTIONS) return

        const howDidYouHearReason = query.data.currentUser?.howDidYouHearReason

        if(!howDidYouHearReason || wuConstants.Regex.empty.test(howDidYouHearReason) || Config.OVERRIDE_INTRO_CHECKS){
            setHowDidYouHearFloaterVisible(true)
        }

        const email = query.data.currentUser?.email
        const name = query.data.currentUser?.name

        if((name && email && name == email) || Config.OVERRIDE_INTRO_CHECKS){
            setEnterNameFloaterVisible(true)
        }

        const latestVersionUsed = localStorage.getItem(Config.localStorageKey.latestVersionUsed)

        if(
            !latestVersionUsed &&
            new Date(query.data.currentUser.createdAt).getTime() < Date.now() - wuConstants.Time.msPerHour
        ){
            setChangelogFloaterVisible(true)
        }

        if(Utils.isNewerVersion(latestVersionUsed, CHANGELOG[0].version)){
            setChangelogFloaterVisible(true)
        }

        localStorage.setItem(Config.localStorageKey.latestVersionUsed, CHANGELOG[0].version)
    }, [dialogStep, query.data.currentUser])

    // load Data
    useEffect(() => {
        if(!auth.isAuthenticated()){
            auth.login()
            return
        }

        if(!auth.getUser()) return

        loadData()
        loadPendingCollaborations()
        setCollaborationReloadAllowed(true)
    }, [])

    //initialize dialogs
    useEffect(() => {
        if(!query.loading && dialogStep == DialogStep.LOADING) {
            setDialogStep(1)
        }
    }, [query.loading])

    useEffect(() => {
        if(pathname.includes("template"))
            setPagename("Template")
        else if(pathname.includes("archive"))
            setPagename("Archive")
        else
            setPagename("Dashboard")
    }, [pathname]);

    const loadData = async () => {
        setQuery(current => ({
            ...current,
            loading: true,
        }))

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
                                    email
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
                                    email
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
                                email
                            }
                        }
                        pendingCollaborations{
                            id
                            user {
                                id
                                name
                                email
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
                            howDidYouHearReason
                            createdAt
                        }
                    }`,
                fetchPolicy: "no-cache"
            },
        )

        if(result.errors){
            console.error(result.errors)
            errorNotification({
                title: "Failed to load dashboard data",
                tryAgainLater: true
            })
        }

        // when creating a new account, the backend sometimes takes too long to create the default template
        // in order for it to still get displayed, the templates might be refetched
        if(!result.data?.currenUser?.howDidYouHearReason && result.data?.templates?.length == 0){
            console.log("scheduled refetch")
            setTimeout(() => {
                refetchTemplates()
            },1000)
        }

        setQuery(result)
    }

    const refetchTemplates = async () => {
        const result = await client.query({
                query: gql`
                    query refetchTemplates{
                        templates {
                            id
                            name
                            shotAttributeCount
                            sceneAttributeCount
                            owner {
                                name
                            }
                        }
                    }`,
                fetchPolicy: "no-cache"
            },
        )

        if(result.errors){
            console.error(result.errors)
            errorNotification({
                title: "Failed to reload templates"
            })
        }

        setQuery(current => ({
            ...current,
            data: {
                ...current.data,
                templates: result.data.templates
            }
        }))
    }

    const incrementDialogStep = (currentStep: DialogStep) => {
        if(dialogStep !== currentStep) return

        setDialogStep(currentStep + 1)
    }

    const loadPendingCollaborations = async (showNotification = false) => {
        setCollaborationReloadAllowed(false)
        setPendingCollaborations(current => ({
            ...current,
            loading: true
        }))

        const result = await client.query({
            query: gql`
                query pendingCollaborations{
                    pendingCollaborations{
                        id
                        owner {
                            name
                            email
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

        setTimeout(()=> {
            setCollaborationReloadAllowed(true)
        }, wuConstants.Time.msPerSecond * 5)


        if(result.errors) {
            errorNotification({
                title: "Failed to load collaboration requests",
                tryAgainLater: true
            })
            return
        }

        setPendingCollaborations(result)

        if(showNotification)
            successNotification({
                title: "Refreshed collaborations",
            })
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
            errorNotification({
                title: `Failed to ${newState} collaboration`,
                tryAgainLater: true
            })
            console.error(result.errors);
            return;
        }

        if(newState == CollaborationState.Accepted) {
            loadData()
        }

        setPendingCollaborations(current => {
            let newCollaborations = current.data.pendingCollaborations?.filter(c => c?.id !== collaborationId) || []

            return {
                ...current,
                data: {
                    ...current.data,
                    pendingCollaborations: newCollaborations
                }
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
        return <LoadingPage/>

    //yeah i know this is ugly
    const isTemplatePage = pathname.includes("template")

    return (
        <DashboardContext.Provider value={{
            query: query,
            setQuery: setQuery,
            pendingCollaborations: pendingCollaborations,
            setPendingCollaborations: setPendingCollaborations,
            dialogStep: dialogStep,
            incrementDialogStep: incrementDialogStep,
            refreshSignal: refreshSignal
        }}>
        <title>Shotly | Dashboard</title>
        <main className="home">
            <PanelGroup autoSaveId={"shotly-dashboard-sidebar-width"} direction="horizontal" className={"PanelGroup"}>
                <Panel
                    defaultSize={20}
                    maxSize={30}
                    minSize={12}
                    className={`sidebar ${isTemplatePage ? "collapse" : ""} ${sidebarOpen ? "open" : "closed"}`}
                >
                    <div className="content">
                        <div className="top">
                            <SimpleTooltip
                                content={<div>
                                    <p><span className="bold">Click</span> to go back to the Dashboard</p>
                                    <p><span className="key">Alt</span> + <span className="key">H</span></p>
                                </div>}
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
                            <h1>{pagename}</h1>
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
                                        (query.data.shotlists.personal as ShotlistDto[])?.sort(Utils.orderShotlistsOrTemplatesByName)?.map((shotlist) => (
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
                                            <p className={"empty"}>No shared shotlists yet</p>
                                        ) :
                                        (query.data.shotlists.shared as ShotlistDto[])?.sort(Utils.orderShotlistsOrTemplatesByName)?.map((shotlist) => (
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
                                        (query.data.templates as TemplateDto[])?.sort(Utils.orderShotlistsOrTemplatesByName)?.map((template) => (
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
                                <Popover.Root open={collaborationRequestOpen} onOpenChange={setCollaborationRequestOpen}>
                                    <SimpleTooltip
                                        content={<p><span className="key">Alt</span> + <span className="key">C</span></p>}
                                    >
                                        <Popover.Trigger className={"collaborationRequestsTrigger"}>
                                            Collaborations
                                            <Inbox size={18}/>
                                            {
                                                pendingCollaborations.data.pendingCollaborations && pendingCollaborations.data.pendingCollaborations.length > 0 &&
                                                <span className={"badge"}>{pendingCollaborations.data.pendingCollaborations.length}</span>
                                            }
                                        </Popover.Trigger>
                                    </SimpleTooltip>
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
                                                            <SimpleTooltip text={collab.owner?.email || "Unknown email"}><span className={"bold"}>{collab.owner?.name}</span></SimpleTooltip>
                                                            {" has invited you to the shotlist "}
                                                            <span className={"bold"}>{collab.shotlist?.name || "Unnamed"}</span>
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
                                                onClick={() => loadPendingCollaborations(true)}
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
                                <Link
                                    href={`/dashboard/${!pathname.includes("archive") ? "archive" : ""}`}
                                    className={pathname.includes("archive") ? "selected" : ""}
                                >
                                    Archive <Archive size={18}/>
                                </Link>
                                <SimpleTooltip content={
                                    <p><span className="key">Alt</span> + <span className="key">A</span></p>
                                }>
                                    <button onClick={openAccountDialog}>Account <User size={18}/></button>
                                </SimpleTooltip>
                            </div>
                        </div>
                    </div>
                    <div className="bottom">
                        <Link className="shotlistTool" href={"/"}><Iconmark/>shotly.at</Link>
                    </div>
                    <button className="closearea" onClick={() => setSidebarOpen(false)}/>
                </Panel>
                <PanelResizeHandle className="PanelResizeHandle sidebarResize"/>
                <Panel className={`headerContainer ${isTemplatePage && "template"}`}>
                    <DashboardHeader
                        query={query}
                        openCreateShotlistDialog={openCreateShotlistDialog}
                        openCreateTemplateDialog={openCreateTemplateDialog}
                    />
                    {children}
                </Panel>
            </PanelGroup>

            <DashboardFloater
                loadData={loadData}
                setRefreshSignal={setRefreshSignal}
                setSidebarOpen={setSidebarOpen}
            />

            {CreateShotlistDialog}
            {CreateTemplateDialog}
            {AccountDialog}

            <JustBoughtProDialog/>

            <Dialog.Root open={easterEggOpen} onOpenChange={setEasterEggOpen}>
                <Dialog.Portal>
                    <Dialog.Content className={"dialogContent"} onOpenAutoFocus={e => e.preventDefault()}>
                        <VisuallyHidden.Root>
                            <Dialog.Title>Hi there</Dialog.Title>
                            <Dialog.Description>Just an easter egg</Dialog.Description>
                        </VisuallyHidden.Root>
                        <Image src={"/ralph-wave.gif"} alt={"Ralph Wave.. sorry you dont get to see this"} width={384} height={288}/>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <div className={"dialogFloater"}>
                {
                    enterNameFloaterVisible &&
                    <EnterNameFloater hideFloater={() => setEnterNameFloaterVisible(false)}/>
                }
                {
                    howDidYouHearFloaterVisible &&
                    <HowDidYouHearFloater hideFloater={() => setHowDidYouHearFloaterVisible(false)}/>
                }
                {
                    changelogFloaterVisible &&
                    <ChangeLogFloater hideFloater={() => setChangelogFloaterVisible(false)}/>
                }
            </div>
        </main>
        </DashboardContext.Provider>
    );
}
