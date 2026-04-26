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
import Separator from "@/components/basic/separator/separator"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import {errorNotification, successNotification} from "@/service/NotificationService"
import JustBoughtProDialog from "@/components/app/dialogs/justBoughtProDialog/justBoughtProDialog"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys" //package has incorrectly configured type exports
import DashboardHeader from "@/components/app/dashboard/dashboardHeader/dashboardHeader"
import EnterNameFloater from "@/components/app/dashboard/floaterDialogs/enterNameFloater"
import HowDidYouHearFloater from "@/components/app/dashboard/floaterDialogs/howDidYouHearFloater"
import ChangeLogFloater from "@/components/app/dashboard/floaterDialogs/changeLogFloater"
import {CHANGELOG} from "@/data/changelog"
import DashboardFloater from "@/components/app/dashboard/dashboardFloater/dashboardFloater";
import DashboardSidebar, {DashboardSidebarRef} from "@/components/app/dashboard/sidebar/dashboardSidebar/dashboardSidebar"
import useDashboardKeybinds from "@/service/useDashboardKeybinds"

export interface DashboardQueryConf {
    loadShotlists: boolean
    loadTemplates: boolean
    loadUser: boolean
}

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const client = useApolloClient()
    const router = useRouter()
    const pathname = usePathname()

    const { openCreateShotlistDialog, CreateShotlistDialog } = useCreateShotlistDialog()
    const { openCreateTemplateDialog, CreateTemplateDialog } = useCreateTemplateDialog()
    const { openAccountDialog, AccountDialog } = useAccountDialog()

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const sidebarRef = useRef<DashboardSidebarRef>(null)

    const [dialogStep, setDialogStep] = useState(DialogStep.LOADING)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

    const [enterNameFloaterVisible, setEnterNameFloaterVisible] = useState(false)
    const [howDidYouHearFloaterVisible, setHowDidYouHearFloaterVisible] = useState(false)
    const [changelogFloaterVisible, setChangelogFloaterVisible] = useState(false)

    const [refreshSignal, setRefreshSignal] = useState(0)

    useDashboardKeybinds({
        openCreateShotlistDialog: openCreateShotlistDialog,
        openCreateTemplateDialog: openCreateTemplateDialog,
        openAccountDialog: openAccountDialog,
        toggleCollaborationRequests: () => sidebarRef.current?.toggleCollaborationRequests()
    })

    // load Data
    useEffect(() => {
        if(!auth.isAuthenticated()){
            auth.login()
            return
        }

        if(!auth.getUser()) return

        loadData()
            .then(result => {
                // when creating a new account, the backend sometimes takes too long to create the default template
                // in order for it to still get displayed, the templates might be refetched
                if(!result.data?.currenUser?.howDidYouHearReason && result.data?.templates?.length == 0){
                    setTimeout(() => {
                        loadData({
                            loadShotlists: false,
                            loadTemplates: true,
                            loadUser: false
                        })
                    },1000)
                }
            })
    }, [])

    //initialize dialogs
    useEffect(() => {
        if(!query.loading && dialogStep == DialogStep.LOADING) {
            setDialogStep(1)
        }
    }, [query.loading])

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

    const loadData = async (
        conf: DashboardQueryConf = {loadShotlists: true, loadTemplates: true, loadUser: true}
    ) => {
        setQuery(current => ({
            ...current,
            loading: true,
        }))

        const result = await client.query({
            query: gql`
                query home($loadShotlists: Boolean!, $loadTemplates: Boolean!, $loadUser: Boolean!){
                    shotlists @include(if: $loadShotlists){
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
                    templates @include(if: $loadTemplates){
                        id
                        name
                        shotAttributeCount
                        sceneAttributeCount
                        owner {
                            name
                            email
                        }
                    }
                    currentUser @include(if: $loadUser){
                        name
                        email
                        howDidYouHearReason
                        createdAt
                    }
                }`,
            variables: conf,
            fetchPolicy: "no-cache"
        })

        if(result.errors){
            console.error(result.errors)
            errorNotification({
                title: "Failed to load dashboard data",
                tryAgainLater: true
            })
        }

        setQuery(current => ({
            ...result,
            data: {
                ...current.data,
                currentUser: conf.loadUser ? result.data.currentUser : current.data.currentUser,
                shotlists: conf.loadShotlists ? result.data.shotlists : current.data.shotlists,
                templates: conf.loadTemplates ? result.data.templates : current.data.templates
            },
        }))

        return result
    }

    const incrementDialogStep = (currentStep: DialogStep) => {
        if(dialogStep !== currentStep) return

        setDialogStep(currentStep + 1)
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
                    <DashboardSidebar
                        ref={sidebarRef}
                        query={query}
                        openCreateShotlistDialog={openCreateShotlistDialog}
                        openCreateTemplateDialog={openCreateTemplateDialog}
                        openAccountDialog={openAccountDialog}
                        setSidebarOpen={setSidebarOpen}
                        reloadShotlists={() => loadData({ loadShotlists: true, loadTemplates: false, loadUser: false })}
                    />
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
                reloadDashboardData={loadData}
                setRefreshSignal={setRefreshSignal}
                setSidebarOpen={setSidebarOpen}
            />

            {CreateShotlistDialog}
            {CreateTemplateDialog}
            {AccountDialog}

            <JustBoughtProDialog/>

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
