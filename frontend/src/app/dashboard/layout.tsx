'use client'

import gql from "graphql-tag"
import Link from "next/link"
import {useApolloClient, useQuery, useSuspenseQuery} from "@apollo/client"
import "./layout.scss"
import LoadingPage from "@/pages/loadingPage/loadingPage"
import React, {useEffect, useState} from "react"
import ErrorPage from "@/pages/errorPage/errorPage"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels"
import {ChevronDown, House, Menu, NotepadText, NotepadTextDashed, Plus, User} from "lucide-react"
import {ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {Collapsible, Separator, Tooltip} from "radix-ui"
import {wuGeneral} from "@yanikkendler/web-utils"
import auth from "@/Auth"
import {usePathname, useRouter} from "next/navigation"
import {useCreateShotlistDialog} from "@/components/dialog/createShotlistDialog/createShotlistDialog"
import {useAccountDialog} from "@/components/dialog/accountDialog/accountDialog"
import Utils from "@/util/Utils"
import Iconmark from "@/components/iconmark"
import {useCreateTemplateDialog} from "@/components/dialog/createTemplateDialog/createTemplateDialog"

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const [query, setQuery] = useState<{ error: any, loading: boolean }>({error: null, loading: true})

    const [shotlists, setShotlists] = useState<ShotlistDto[] | null>(null)
    const [templates, setTemplates] = useState<TemplateDto[] | null>(null)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

    const client = useApolloClient()
    const router = useRouter()
    const pathname = usePathname()

    const { openCreateShotlistDialog, CreateShotlistDialog } = useCreateShotlistDialog()
    const { openCreateTemplateDialog, CreateTemplateDialog } = useCreateTemplateDialog()
    const { openAccountDialog, AccountDialog } = useAccountDialog()

    useEffect(() => {
        if(!auth.isAuthenticated()){
            router.replace('/')
            return
        }

        if(!auth.getUser()) return

        loadData()
    }, []);

    const loadData = async () => {
        const { data, error, loading } = await client.query({query: gql`
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

        setQuery({error, loading})

        setShotlists(data.shotlists)
        setTemplates(data.templates)
    }

    if(query.error) return <ErrorPage settings={{
        title: 'Data could not be loaded',
        description: query.error.message,
        link: {
            text: 'Dashboard',
            href: '../dashboard'
        }
    }}/>
    if(query.loading) return <LoadingPage text={"loading your dashboard"}/>

    return (
        <main className="home">
            <PanelGroup autoSaveId={"shotly-dashboard-sidebar-width"} direction="horizontal" className={"PanelGroup"}>
                <Panel defaultSize={20} maxSize={30} minSize={12}
                       className={`sidebar ${pathname?.includes("template") ? "collapse" : ""} ${sidebarOpen ? "open" : "closed"}`}>
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
                                        !shotlists || shotlists.length === 0 ? (
                                                <button onClick={openCreateShotlistDialog} className={"create"}>
                                                    create new <Plus size={16}/>
                                                </button>) :
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
                                        !templates || templates.length === 0 ? (
                                                <p className="empty">Nothing here yet</p>)
                                            :
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
