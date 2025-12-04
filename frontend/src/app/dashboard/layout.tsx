'use client'

import gql from "graphql-tag"
import Link from "next/link"
import {ApolloError, ApolloQueryResult, useApolloClient, useQuery, useSuspenseQuery} from "@apollo/client"
import "./layout.scss"
import React, {useEffect, useState} from "react"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import {ChevronDown, House, Menu, NotepadText, NotepadTextDashed, Plus, User} from "lucide-react"
import {Query, ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {Collapsible, Separator, Tooltip} from "radix-ui"
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

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const client = useApolloClient()
    const router = useRouter()
    const pathname = usePathname()

    const { openCreateShotlistDialog, CreateShotlistDialog } = useCreateShotlistDialog()
    const { openCreateTemplateDialog, CreateTemplateDialog } = useCreateTemplateDialog()
    const { openAccountDialog, AccountDialog } = useAccountDialog()

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    const [shotlists, setShotlists] = useState<ShotlistDto[] | null>(null)
    const [templates, setTemplates] = useState<TemplateDto[] | null>(null)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

    useEffect(() => {
        if(!auth.isAuthenticated()){
            router.replace('/')
            return
        }

        if(!auth.getUser()) return

        loadData()
    }, [])

    const loadData = async () => {
        console.log("loading dashboard layout data")

        try {
            const result = await client.query({query: gql`
                    query home{
                        shotlists{
                            id
                            name
                            sceneCount
                            shotCount
                            editedAt
                        }
                        templates {
                            id
                            name
                        }
                    }`,
                    fetchPolicy: "no-cache"
                }
            )

            setQuery(result)

            setShotlists(result.data.shotlists)
            setTemplates(result.data.templates)
        }
        catch (error) {
            setQuery({...query, error: error as ApolloError})
        }
    }

    if(query.error) return <ErrorPage
        title='Data could not be loaded'
        description={query.error.message}
        reload={true}
    />

    if(!auth.getUser()) return (
        <LoadingPage title={"logging you in..."}/>
    )

    return (
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
                            <Tooltip.Root>
                                <Tooltip.Trigger className={"noPadding gripTooltipTrigger"} asChild>
                                    <Link href={`/dashboard`} onClick={e => {
                                        wuGeneral.onNthClick(() => {
                                            window.open("https://orteil.dashnet.org/cookieclicker", '_blank')?.focus()
                                        }, e.nativeEvent, 10)
                                    }}>
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
                                            <Skeleton/>
                                            <Skeleton/>
                                        </> :
                                        !shotlists || shotlists.length === 0 ? (
                                            <button onClick={openCreateShotlistDialog} className={"create"}>
                                                create new <Plus size={16}/>
                                            </button>
                                        ) :
                                        shotlists.sort(Utils.orderShotlistsOrTemplatesByName).map((shotlist) => (
                                            <Link key={shotlist.id} href={`/shotlist/${shotlist.id}`}>
                                                <NotepadText size={18}/>
                                                {shotlist.name ? <span className={"wrap"}>{shotlist.name}</span> : (
                                                    <span className={"italic"}>Unnamed</span>)}
                                            </Link>
                                        ))
                                    }
                                </Collapsible.Content>
                            </Collapsible.Root>

                            <Collapsible.Root className={"CollapsibleRoot dashboardSidebar"} defaultOpen={false}>
                                <Collapsible.Trigger className={"noClickFx"}>
                                    Shared Shotlists <ChevronDown size={18} className={"chevron"}/>
                                </Collapsible.Trigger>
                                <Collapsible.Content
                                    className="CollapsibleContent dashboardSidebar"
                                >
                                    <p className={"empty"}>work in progress</p>
                                </Collapsible.Content>
                            </Collapsible.Root>

                            <Separator.Separator decorative orientation="horizontal" className={"Separator"}/>

                            <Collapsible.Root className={"CollapsibleRoot dashboardSidebar"} defaultOpen={true}>
                                <Collapsible.Trigger className={"noClickFx"}>
                                    My Templates <ChevronDown size={18} className={"chevron"}/>
                                </Collapsible.Trigger>
                                <Collapsible.Content
                                    className="CollapsibleContent dashboardSidebar"
                                >
                                    {
                                        query.loading ? <>
                                            <Skeleton/>
                                            <Skeleton/>
                                        </> :
                                        !templates || templates.length === 0 ? (
                                            <p className="empty">Nothing here yet</p>
                                        ) :
                                        templates.sort(Utils.orderShotlistsOrTemplatesByName).map((template) => (
                                            <Link key={template.id} href={`/dashboard/template/${template.id}`}
                                                  className={"template"}>
                                                <NotepadTextDashed size={18}/>
                                                {template.name ? <span className={"wrap"}>{template.name}</span> : (
                                                    <span className={"italic"}>Unnamed</span>)}
                                            </Link>
                                        ))
                                    }
                                </Collapsible.Content>
                            </Collapsible.Root>
                            <Collapsible.Root className={"CollapsibleRoot dashboardSidebar"} defaultOpen={false}>
                                <Collapsible.Trigger className={"noClickFx"}>
                                    Shared Templates <ChevronDown size={18} className={"chevron"}/>
                                </Collapsible.Trigger>
                                <Collapsible.Content
                                    className="CollapsibleContent dashboardSidebar"
                                >
                                    <p className={"empty"}>work in progress</p>
                                </Collapsible.Content>
                            </Collapsible.Root>

                            <div className="bottom">
                                <button className="shotlist new" onClick={openCreateShotlistDialog}>New
                                    Shotlist <NotepadText size={18}/></button>
                                <button className="template new" onClick={openCreateTemplateDialog}>New
                                    Template <NotepadTextDashed size={18}/></button>
                                <button onClick={openAccountDialog}>Account <User size={18}/></button>
                            </div>
                        </div>
                    </div>
                    <div className="bottom">
                        <Link className="shotlistTool" href={"/"}><Iconmark/>shotly.at</Link>
                    </div>
                    <button className="closearea" onClick={() => setSidebarOpen(false)}/>
                </Panel>
                <PanelResizeHandle className="PanelResizeHandle"/>
                <Panel className={`headerContainer ${pathname?.includes("template") ? "template" : ""}`}>
                    <div className="header">
                        <button className="template" onClick={openCreateTemplateDialog}>New Template</button>
                        <button className="shotlist" onClick={openCreateShotlistDialog}>New Shotlist</button>
                    </div>
                    {children}
                </Panel>
            </PanelGroup>
            {
                /*Yeah i know this is ugly*/
                pathname?.includes("template") &&
                <button className="openSidebar" onClick={() => setSidebarOpen(true)}><Menu/></button>
            }

            {CreateShotlistDialog}
            {CreateTemplateDialog}
            {AccountDialog}
        </main>
    );
}
