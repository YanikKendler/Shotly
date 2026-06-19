'use client'

import gql from "graphql-tag"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import "./layout.scss"
import React, {useContext, useEffect, useRef, useState} from "react"
import ErrorPage from "@/components/app/feedback/errorPage/errorPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import { Query } from "../../../../lib/graphql/generated"
import auth from "@/Auth"
import {usePathname, useRouter} from "next/navigation"
import {useCreateShotlistDialog} from "@/components/app/dialogs/createShotlistDialog/createShotlistDialog"
import Utils from "@/utility/Utils"
import {useCreateTemplateDialog} from "@/components/app/dialogs/createTemplateDialog/createTemplateDialog"
import LoadingPage from "@/components/app/feedback/loadingPage/loadingPage"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import Config from "@/Config"
import {errorNotification} from "@/service/NotificationService"
import JustBoughtProDialog from "@/components/app/dialogs/justBoughtProDialog/justBoughtProDialog"
import DashboardHeader from "@/components/app/dashboard/dashboardHeader/dashboardHeader"
import EnterNameFloater from "@/components/app/dashboard/floaterDialogs/enterNameFloater"
import HowDidYouHearFloater from "@/components/app/dashboard/floaterDialogs/howDidYouHearFloater"
import ChangeLogFloater from "@/components/app/dashboard/floaterDialogs/changeLogFloater"
import {CHANGELOG} from "@/data/changelog"
import DashboardFloater from "@/components/app/dashboard/dashboardFloater/dashboardFloater";
import DashboardSidebar from "@/components/app/dashboard/sidebar/dashboardSidebar/dashboardSidebar"
import useDashboardKeybinds from "@/service/useDashboardKeybinds"
import DashboardDialogFloater from "@/components/app/dashboard/dashboardDialogFloater/dashboardDialogFloater"
import {AppContext} from "@/context/AppContext"

export interface DashboardQueryConf {
    loadShotlists: boolean
    loadTemplates: boolean
    loadUser: boolean
}

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const client = useApolloClient()
    const pathname = usePathname()
    const appContext = useContext(AppContext)

    const createShotlistDialog = useCreateShotlistDialog()
    const createTemplateDialog = useCreateTemplateDialog()

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [dialogStep, setDialogStep] = useState(DialogStep.LOADING)

    const [enterNameFloaterVisible, setEnterNameFloaterVisible] = useState(false)
    const [howDidYouHearFloaterVisible, setHowDidYouHearFloaterVisible] = useState(false)
    const [changelogFloaterVisible, setChangelogFloaterVisible] = useState(false)

    const [refreshSignal, setRefreshSignal] = useState(0)

    useDashboardKeybinds({
        openCreateShotlistDialog: createShotlistDialog.open,
        openCreateTemplateDialog: createTemplateDialog.open,
        closeAll: () => {
            createShotlistDialog.close()
            createTemplateDialog.close()
        }
    })

    // load Data
    useEffect(() => {
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
        if(!appContext.currentUser) return

        if(dialogStep != DialogStep.QUESTIONS) return

        const howDidYouHearReason = appContext.currentUser?.howDidYouHearReason

        if(!howDidYouHearReason || wuConstants.Regex.empty.test(howDidYouHearReason) || Config.OVERRIDE_INTRO_CHECKS){
            setHowDidYouHearFloaterVisible(true)
        }

        const email = appContext.currentUser?.email
        const name = appContext.currentUser?.name

        if((name && email && name == email) || Config.OVERRIDE_INTRO_CHECKS){
            setEnterNameFloaterVisible(true)
        }

        const latestVersionUsed = localStorage.getItem(Config.localStorageKey.latestVersionUsed)

        if(
            !latestVersionUsed &&
            new Date(appContext.currentUser.createdAt).getTime() < Date.now() - wuConstants.Time.msPerHour
        ){
            setChangelogFloaterVisible(true)
        }

        if(Utils.isNewerVersion(latestVersionUsed, CHANGELOG[0].version)){
            setChangelogFloaterVisible(true)
        }
    }, [dialogStep, appContext.currentUser])

    const loadData = async (
        conf: DashboardQueryConf = {loadShotlists: true, loadTemplates: true, loadUser: true}
    ) => {
        setQuery(current => ({
            ...current,
            loading: true,
        }))

        const result = await client.query({
            query: gql`
                query home($loadShotlists: Boolean!, $loadTemplates: Boolean!){
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
                <DashboardSidebar
                    query={query}
                    openCreateShotlistDialog={createShotlistDialog.open}
                    reloadShotlists={() => loadData({ loadShotlists: true, loadTemplates: false, loadUser: false })}
                />
                <PanelResizeHandle className="PanelResizeHandle sidebarResize"/>
                <Panel className={`headerContainer ${isTemplatePage && "template"}`}>
                    <DashboardHeader
                        query={query}
                        openCreateShotlistDialog={createShotlistDialog.open}
                        openCreateTemplateDialog={createTemplateDialog.open}
                    />
                    {children}
                </Panel>
            </PanelGroup>

            <DashboardFloater
                reloadDashboardData={loadData}
                setRefreshSignal={setRefreshSignal}
            />

            {createShotlistDialog.Element}
            {createTemplateDialog.Element}

            <JustBoughtProDialog/>

            <DashboardDialogFloater
                visible={enterNameFloaterVisible || howDidYouHearFloaterVisible || changelogFloaterVisible}
            >
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
                    <ChangeLogFloater hideFloater={() => {
                        setChangelogFloaterVisible(false)
                        localStorage.setItem(Config.localStorageKey.latestVersionUsed, CHANGELOG[0].version)
                    }}/>
                }
            </DashboardDialogFloater>
        </main>
        </DashboardContext.Provider>
    );
}
