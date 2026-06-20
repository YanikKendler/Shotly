'use client'

import Link from "next/link"
import "./dashboard.scss"
import React, {useContext, useEffect, useState} from "react"
import ErrorPage from "@/components/app/feedback/errorPage/errorPage"
import {ArrowRight, ChevronLeft, ChevronRight, Plus,} from "lucide-react"
import {ShotlistDto, TemplateDto} from "../../../../lib/graphql/generated"
import {useCreateShotlistDialog} from "@/components/app/dialogs/createShotlistDialog/createShotlistDialog"
import Utils from "@/utility/Utils"
import Config from "@/Config"
import {useCreateTemplateDialog} from "@/components/app/dialogs/createTemplateDialog/createTemplateDialog"
import Skeleton from "react-loading-skeleton"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"
import DashboardGridShotlist from "@/components/app/dashboard/grid/dashboardGridItem/dashboardGridShotlist"
import DashboardGridTemplate from "@/components/app/dashboard/grid/dashboardGridItem/dashboardGridTemplate"
import DashboardGrid from "@/components/app/dashboard/grid/dashboardGrid/dashboardGrid"
import useIntro from "@/service/useIntro"
import ViewPortSwitcher from "@/components/utility/viewportSwitcher/viewPortSwitcher"

export default function Overview() {
    const dashboardContext = useContext(DashboardContext)

    const [shotlists, setShotlists] = useState<ShotlistDto[]>([])
    const [templates, setTemplates] = useState<TemplateDto[]>([])

    const createShotlistDialog = useCreateShotlistDialog()
    const createTemplateDialog = useCreateTemplateDialog()

    const intro = useIntro({
        steps: [
            { popover: { title: 'Welcome to Shotly', description: 'You will now get a quick tour of the Dashboard.' } },
            {
                element: '.sidebar',
                popover: {
                    title: 'The Sidebar',
                    description: 'Here you see all your shotlists and Templates. You currently dont have any Shotlists, but a default Template was automatically created!',
                    side: "right",
                    align: 'center'
                }
            },
            {
                element: '.sidebar .content .list .bottom',
                popover: {
                    title: 'Account & Activity',
                    description: 'Shotlist invites will be visible under "Collaborations". Using the "Account" button you can modify your account and change your settings.',
                    side: "right",
                    align: 'center'
                }
            },
            {
                element: window.innerWidth < 500 ? '.sidebar .content .list .bottom .new.shotlist' : '.dashboardGridItem.add.shotlist',
                popover: {
                    title: "Your next step",
                    description: 'Click here to create a new Shotlist.',
                    side: "bottom",
                    align: 'center'
                }
            },
        ],
        telemetryLocation: "Dashboard",
        onDestroy: () => dashboardContext.incrementDialogStep(DialogStep.TOUR)
    })

    //dashboard tour
    useEffect(() => {
        if(dashboardContext.dialogStep !== DialogStep.TOUR) return

        if(localStorage.getItem(Config.localStorageKey.dashboardTourCompleted) != "true" || Config.OVERRIDE_INTRO_CHECKS){
            localStorage.setItem(Config.localStorageKey.dashboardTourCompleted, "true")
            intro.show()
        }
        else{
            dashboardContext.incrementDialogStep(DialogStep.TOUR)
        }
    }, [dashboardContext.dialogStep])

    useEffect(() => {
        if(!dashboardContext.query || !dashboardContext.query.data || !dashboardContext.query.data.shotlists) return;

        const newShotlists = [
            ...dashboardContext.query.data.shotlists.personal || [],
            ...dashboardContext.query.data.shotlists.shared || []
        ]

        setShotlists((newShotlists as ShotlistDto[])?.sort(Utils.oderShotlistsByChangeDate))
        setTemplates(dashboardContext.query.data.templates as TemplateDto[])
    }, [dashboardContext.query]);

    if(dashboardContext.query.error) return (
        <main className="overview dashboardContent">
            <ErrorPage
                title='Data could not be loaded'
                description={dashboardContext.query.error.message}
                reload
                noLink
            />
        </main>
    )

    if(dashboardContext.query.errors) return (
        <main className="overview dashboardContent">
            <ErrorPage
                title='Data could not be loaded'
                description={dashboardContext.query.errors.map(e => e.message).join(", ")}
                reload
                noLink
            />
        </main>
    )

    if(dashboardContext.query.loading) return (
        <main className="overview dashboardContent">
            <h2>Shotlists</h2>
            <DashboardGrid>
                <Skeleton height={125}/>
                <Skeleton height={125}/>
            </DashboardGrid>
            <h2>Templates</h2>
            <DashboardGrid>
                <Skeleton height={125}/>
                <Skeleton height={125}/>
            </DashboardGrid>
        </main>
    )

    return (
        <main className="overview dashboardContent">
            <h2>Shotlists</h2>
            <DashboardGrid>
                {shotlists.slice(0, 8).map((shotlist: ShotlistDto) => (
                    <DashboardGridShotlist shotlist={shotlist} key={shotlist.id}/>
                ))}
                <button className={"dashboardGridItem add shotlist"} onClick={() => {
                    intro.cancel()
                    createShotlistDialog.open()
                }}>
                    <span><Plus size={22}/>New Shotlist</span>
                </button>
            </DashboardGrid>
            <h2>Templates</h2>
            <DashboardGrid>
                {templates?.slice(0, 8)?.sort(Utils.orderShotlistsOrTemplatesByName)?.map((template: TemplateDto) => (
                    <DashboardGridTemplate template={template} key={template.id}/>
                ))}
                <button className={"dashboardGridItem add template"} onClick={createTemplateDialog.open}>
                    <span><Plus size={22}/>New Template</span>
                </button>
            </DashboardGrid>
            <ViewPortSwitcher breakpoint={600} over={
                <Link href={"/dashboard/archive"} className={"archive default"}>Archive <ArrowRight size={16} strokeWidth={2}/></Link>
            }/>

            {createShotlistDialog.Element}
            {createTemplateDialog.Element}
        </main>
    );
}
