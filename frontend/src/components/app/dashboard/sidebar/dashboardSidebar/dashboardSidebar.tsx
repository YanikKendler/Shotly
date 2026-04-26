"use client"

import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import { wuGeneral } from "@yanikkendler/web-utils"
import {Archive, Blocks, House, NotepadText, Plus, User} from "lucide-react"
import {ApolloQueryResult} from "@apollo/client"
import { Query, ShotlistDto, TemplateDto} from "../../../../../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import Separator from "@/components/basic/separator/separator"
import Iconmark from "@/components/logo/iconmark"
import {usePathname} from "next/navigation"
import {Dispatch, forwardRef, SetStateAction, useEffect, useImperativeHandle, useRef, useState} from "react"
import CollaborationRequestsPopup, {
    CollaborationRequestsPopupRef
} from "@/components/app/dashboard/sidebar/dashboardCollaboratorsPopup/collaborationRequestsPopup"
import Link from "next/link"
import DashboardSidebarSection from "@/components/app/dashboard/sidebar/dashboardSidebarSection/dashboardSidebarSection"
import "./dashboardSidebar.scss"

export interface DashboardSidebarRef {
    toggleCollaborationRequests: () => void
}

export interface DashboardSidebarProps {
    query: ApolloQueryResult<Query>
    reloadShotlists: () => void
    openCreateShotlistDialog: () => void
    openCreateTemplateDialog: () => void
    openAccountDialog: () => void
    setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

const DashboardSidebar = forwardRef<DashboardSidebarRef, DashboardSidebarProps>(({
    query,
    reloadShotlists,
    openCreateShotlistDialog,
    openCreateTemplateDialog,
    openAccountDialog,
    setSidebarOpen
}, ref) => {
    const pathname = usePathname()

    const collabPopupRef = useRef<CollaborationRequestsPopupRef>(null);

    const [pagename, setPagename] = useState("Dashboard")

    useEffect(() => {
        if(pathname.includes("template"))
            setPagename("Template")
        else if(pathname.includes("archive"))
            setPagename("Archive")
        else
            setPagename("Dashboard")
    }, [pathname])

    useImperativeHandle(ref, () => ({
        toggleCollaborationRequests: () => {
            collabPopupRef.current?.toggleCollaborationRequests()
        }
    }))

    return (<>
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
                <DashboardSidebarSection
                    title={"My Shotlists"}
                    isLoading={query.loading}
                    empty={
                        <button onClick={openCreateShotlistDialog} className={"create"}>
                            Create new <Plus size={16}/>
                        </button>
                    }
                    entries={
                        (query.data.shotlists?.personal as ShotlistDto[])
                            ?.sort(Utils.orderShotlistsOrTemplatesByName)
                            ?.map((shotlist) => ({
                                name: shotlist.name,
                                link: `/shotlist/${shotlist.id}`,
                                icon: <NotepadText size={18}/>
                            }))
                    }
                />

                <DashboardSidebarSection
                    title={"Shared Shotlists"}
                    isLoading={query.loading}
                    empty={<p className={"empty"}>No shared shotlists yet</p>}
                    entries={
                        (query.data.shotlists?.shared as ShotlistDto[])
                            ?.sort(Utils.orderShotlistsOrTemplatesByName)
                            ?.map((shotlist) => ({
                                name: shotlist.name,
                                link: `/shotlist/${shotlist.id}`,
                                icon: <NotepadText size={18}/>
                            }))
                    }
                />

                <Separator/>

                <DashboardSidebarSection
                    title={"My Templates"}
                    isLoading={query.loading}
                    empty={<p className={"empty"}>Nothing here yet</p>}
                    entries={
                        (query.data.templates as TemplateDto[])
                            ?.sort(Utils.orderShotlistsOrTemplatesByName)
                            ?.map((template) => ({
                                name: template.name,
                                link: `/dashboard/template/${template.id}`,
                                icon: <Blocks size={18}/>
                            }))
                    }
                />

                <div className="bottom">
                    {/*only visible on mobile (via CSS)*/}
                    <button className="shotlist new accent" onClick={openCreateShotlistDialog}>
                        New Shotlist <NotepadText size={18}/>
                    </button>
                    <button className="template new accent" onClick={openCreateTemplateDialog}>
                        New Template <Blocks size={18}/>
                    </button>
                    {/*always visible*/}
                    <CollaborationRequestsPopup ref={collabPopupRef} reloadShotlists={reloadShotlists}/>
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
            <Link className="shotlistTool" href={"/public"}><Iconmark/>shotly.at</Link>
        </div>
        <button className="closearea" onClick={() => setSidebarOpen(false)}/>
    </>)
})

export default DashboardSidebar