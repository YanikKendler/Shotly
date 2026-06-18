"use client"

import {Blocks, NotepadText, Plus} from "lucide-react"
import {ApolloQueryResult} from "@apollo/client"
import { Query, ShotlistDto, TemplateDto} from "../../../../../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import Separator from "@/components/basic/separator/separator"
import {usePathname} from "next/navigation"
import {useEffect, useState} from "react"
import DashboardSidebarSection from "@/components/app/dashboard/sidebar/dashboardSidebarSection/dashboardSidebarSection"
import "./dashboardSidebar.scss"
import Sidebar from "@/components/app/sidebar/sidebar"

//TODO template selected state
export default function DashboardSidebar ({
    query,
    reloadShotlists,
    openCreateShotlistDialog,
} : {
    query: ApolloQueryResult<Query>
    reloadShotlists: () => void
    openCreateShotlistDialog: () => void
}){
    const pathname = usePathname()

    const [pagename, setPagename] = useState("Dashboard")

    useEffect(() => {
        if(pathname.includes("template"))
            setPagename("Template")
        else if(pathname.includes("archive"))
            setPagename("Archive")
        else
            setPagename("Dashboard")
    }, [pathname])

    return (
        <Sidebar
            className={"dashboardSidebar"}
            heading={pagename}
            list={<>
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
            </>}
            isLoading={query.loading}
            onCollaborationAccepted={reloadShotlists}
        />
    )
}