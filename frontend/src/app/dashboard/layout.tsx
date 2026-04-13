'use client'

import gql from "graphql-tag"
import Link from "next/link"
import {ApolloQueryResult, InteropQueryResult, useApolloClient} from "@apollo/client"
import "./layout.scss"
import React, {useEffect, useRef, useState} from "react"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import {Blocks, Check, ChevronDown, House, Inbox, Menu, NotepadText, Plus, RefreshCw, User, X} from "lucide-react"
import {CollaborationDto, CollaborationState, Query, ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {Collapsible, Dialog, Popover, VisuallyHidden} from "radix-ui"
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
import {DashboardContext, DialogStep} from "@/context/DashboardContext"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import Config from "@/Config"
import HelpLink from "@/components/helpLink/helpLink"
import Separator from "@/components/separator/separator"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import {errorNotification} from "@/service/NotificationService"
import Radio, {RadioResult} from "@/components/inputs/radio/radio"
import JustBoughtProDialog from "@/components/dialogs/justBoughtProDialog/justBoughtProDialog"
import TextField from "@/components/inputs/textField/textField"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import Image from "next/image"
import {BUILD_INFO} from "../../../buildinfo"
import {marked} from "marked"
import {CHANGELOG} from "@/data/changelog" //package has incorrectly configured type exports

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

    const [enterNameDialogOpen, setEnterNameDialogOpen] = useState(false)
    const [newName, setNewName] = useState<string>("")

    const [howDidYouHearDialogOpen, setHowDidYouHearDialogOpen] = useState(false)
    const [howDidYouHearReason, setHowDidYouHearReason] = useState("")
    const [howDidYouHearText, setHowDidYouHearText] = useState("")

    const [changelogDialogOpen, setChangelogDialogOpen] = useState(false)

    const [easterEggOpen, setEasterEggOpen] = useState(false)

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
            "Alt+H": event => {
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
            setHowDidYouHearDialogOpen(true)
        }

        const email = query.data.currentUser?.email
        const name = query.data.currentUser?.name

        if((name && email && name == email) || Config.OVERRIDE_INTRO_CHECKS){
            setEnterNameDialogOpen(true)
        }

        const latestVersionUsed = localStorage.getItem(Config.localStorageKey.latestVersionUsed)
        if(latestVersionUsed && latestVersionUsed != "" && latestVersionUsed != CHANGELOG[0].version){
            setChangelogDialogOpen(true)
        }
        localStorage.setItem(Config.localStorageKey.latestVersionUsed, CHANGELOG[0].version)
    }, [dialogStep, query.data.currentUser])

    // load Data
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

    //initialize dialogs
    useEffect(() => {
        if(!query.loading && dialogStep == DialogStep.LOADING) {
            setDialogStep(1)
        }
    }, [query.loading])

    const loadData = async () => {
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
                            howDidYouHearReason
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
        console.log("refetch")

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

    const loadPendingCollaborations = async () => {
        try {
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

            setPendingCollaborations(result)
        }
        catch (error) {
            errorNotification({
                title: "Failed to load collaboration requests",
                tryAgainLater: true
            })
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

    const handleNewUserNameSubmit = () => {
        if(wuConstants.Regex.empty.test(newName)) return

        client.mutate({
                mutation: gql`
                    mutation updateUser($name: String!){
                        updateUser(editDTO: {
                            name: $name
                        }) {
                            id
                            name
                        }
                    }`,
                variables: {name: newName.trim()},
            },
        ).then(({errors}) => {
            if(errors) {
                errorNotification({
                    title: "Failed to update Username",
                    tryAgainLater: true
                })
                console.error("Error updating username:", errors);
            }
        })

        setEnterNameDialogOpen(false)
    }

    const handleHowDidYouHearReasonChange = (result: RadioResult) => {
        setHowDidYouHearReason(result.value || "")
        if(result.value == "other")
            setHowDidYouHearText(result.otherText)
    }

    const handleHowDidYouHearReasonSubmit = () => {
        let reason = howDidYouHearReason
        if(howDidYouHearReason == "other")
            reason = howDidYouHearText

        client.mutate({
            mutation: gql`
                mutation setHowDidYourHearReason($reason: String!){
                    howDidYourHearReason(reason: $reason) {
                        id
                    }
                }
            `,
            variables: {reason: reason}
        }).then(({errors}) => {
            if(errors){
                console.error(errors)
                errorNotification({
                    title: "Failed to submit feedback",
                })
            }
        })

        setHowDidYouHearDialogOpen(false)
    }

    if(query.error) return <ErrorPage
        title='Data could not be loaded'
        description={query.error.message}
        reload
        noLink
    />

    if(!auth.getUser())
        return <LoadingPage title={Config.loadingMessage.authGetUser}/>

    //yeah i know this is ugly
    const isTemplatePage = pathname.includes("template")

    return (
        <DashboardContext.Provider value={{
            query: query,
            setQuery: setQuery,
            pendingCollaborations: pendingCollaborations,
            setPendingCollaborations: setPendingCollaborations,
            dialogStep: dialogStep,
            incrementDialogStep: incrementDialogStep
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
                                <SimpleTooltip content={<p><span className="key">Alt</span> + <span className="key">A</span></p>}>
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
                    <div className="header">
                        {
                            query.loading ?
                            <>
                                <Skeleton height="2rem" width="12ch"/>
                                <Skeleton height="2rem" width="12ch"/>
                            </>
                            :
                            <>
                                <SimpleTooltip
                                    content={<p><span className="key">Alt</span> + <span className="key">T</span></p>}
                                >
                                    <button className="template" onClick={openCreateTemplateDialog}>New Template</button>
                                </SimpleTooltip>
                                <SimpleTooltip
                                    content={<p><span className="key">Alt</span> + <span className="key">N</span> or <span className="key">Alt</span> + <span className="key">S</span></p>}
                                >
                                    <button className="shotlist" onClick={openCreateShotlistDialog}>New Shotlist</button>
                                </SimpleTooltip>
                            </>
                        }
                    </div>
                    {children}
                </Panel>
            </PanelGroup>

            <div className="floater">
                <HelpLink
                    link={`https://docs.shotly.at/${isTemplatePage ? "templates" : "dashboard"}`}
                    name={isTemplatePage ? "Template" : "Dashboard"}
                />
                {
                    isTemplatePage &&
                    <button className="openSidebar" onClick={() => setSidebarOpen(true)}><Menu/></button>
                }
            </div>

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
                    enterNameDialogOpen &&
                    <div className="enterName">
                        <h3>Welcome</h3>
                        <p>
                            <span className="bold">Please enter your name (or nickname).</span>
                            <br/>
                            <span className="gray">This name will be visible to others and can not be used to log in.</span>
                        </p>
                        <TextField
                            value={newName}
                            valueChange={setNewName}
                            label={"Your name"}
                            maxWidth={"100%"}
                            placeholder={"Quentin Tarantino"}
                            color={"accent"}
                        />
                        <p className={"small"}>You can always change your name in the Account settings.</p>

                        <button
                            disabled={wuConstants.Regex.empty.test(newName)}
                            onClick={handleNewUserNameSubmit}
                            className={"main"}
                        >
                            Done
                        </button>
                    </div>
                }
                {
                    howDidYouHearDialogOpen &&
                    <div className="howDidYouHear">
                        <h3>How did you hear about Shotly?</h3>
                        <Radio
                            options={[
                                {value: "friend", label: "A friend"},
                                {value: "work", label: "Work or colleagues"},
                                {value: "reddit", label: "A Reddit post"},
                                {value: "search", label: "A search engine (Google, Bing, etc.)"},
                                {value: "ai", label: "An AI (GPT, Gemini, etc.)"},
                            ]}
                            value={howDidYouHearReason}
                            onValueChange={handleHowDidYouHearReasonChange}
                            textOption={true}
                        />
                        <button
                            disabled={
                                (howDidYouHearReason == "") ||
                                (howDidYouHearReason == "other" && howDidYouHearText.length < 4)
                            }
                            onClick={handleHowDidYouHearReasonSubmit}
                            className={"main"}
                        >
                            Send
                        </button>
                    </div>
                }
                {
                    changelogDialogOpen &&
                    <div className="changelog">
                        <div className={"top"}>
                            <h3>Whats new?</h3>
                            <span className={"bold small gray"}>Shotly v{CHANGELOG[0].version}</span>
                        </div>
                        <div dangerouslySetInnerHTML={{__html: marked.parse(Utils.cleanMarkdownString(CHANGELOG[0].changes))}}></div>
                        <div className="buttons">
                            <button
                                onClick={() => setChangelogDialogOpen(false)}
                                className={"main"}
                            >
                                Close
                            </button>
                            <Link href={"/changelog"} target={"_blank"} className={"secondary"}>Changelog</Link>
                        </div>
                    </div>
                }
            </div>
        </main>
        </DashboardContext.Provider>
    );
}
