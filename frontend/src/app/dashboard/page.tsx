'use client'

import Link from "next/link"
import "./dashboard.scss"
import React, {useContext, useEffect, useState} from "react"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import {Blocks, NotepadText, Plus,} from "lucide-react"
import {ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {wuTime} from "@yanikkendler/web-utils"
import {useCreateShotlistDialog} from "@/components/dialogs/createShotlistDialog/createShotlistDialog"
import Utils from "@/util/Utils"
import Config from "@/Config"
import {useCreateTemplateDialog} from "@/components/dialogs/createTemplateDialog/createTemplateDialog"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Skeleton from "react-loading-skeleton"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import DashboardGridShotlist from "@/components/dashboard/dashboardGridItem/dashboardGridShotlist"
import DashboardGridTemplate from "@/components/dashboard/dashboardGridItem/dashboardGridTemplate"
import DashboardGrid from "@/components/dashboard/dashboardGrid/dashboardGrid"

export default function Overview() {
    const dashboardContext = useContext(DashboardContext)

    const [shotlists, setShotlists] = useState<ShotlistDto[]>([])
    const [templates, setTemplates] = useState<TemplateDto[]>([])

    const { openCreateShotlistDialog, CreateShotlistDialog } = useCreateShotlistDialog()
    const { openCreateTemplateDialog, CreateTemplateDialog } = useCreateTemplateDialog()

    const driverObj = driver({
        showProgress: true,
        allowClose: true,
        steps: [
            { popover: { title: 'Welcome to Shotly', description: 'You will now get a quick tour of the Dashboard.' } },
            { element: '.sidebar', popover: {
                title: 'The Sidebar',
                description: 'Here you see all your shotlists and Templates. You currently dont have any Shotlists, but a default Template was automatically created!',
                side: "right",
                align: 'center'
            }},
            { element: '.sidebar .content .list .bottom', popover: {
                title: 'Account & Activity',
                description: 'If someone invites you to their shotlist the request will be visible under "Collaborations". Using the "Account" button you can modify your account and change your settings.',
                side: "right",
                align: 'center'
            }},
/*
            { element: '.sidebar .template', popover: { description: 'You can use it when creating your first shotlist to start with a default attribute for shots and scenes.', side: "right", align: 'center' }},
*/
            { element: '.gridItem.add.shotlist', popover: { description: 'Click here to create a new Shotlist.', side: "bottom", align: 'center' }},
        ],
        onDestroyed: () => {
            dashboardContext.incrementDialogStep(DialogStep.TOUR)
        },
    })

    //dashboard tour
    useEffect(() => {
        if(dashboardContext.dialogStep !== DialogStep.TOUR) return

        if(localStorage.getItem(Config.localStorageKey.dashboardTourCompleted) != "true" || Config.OVERRIDE_INTRO_CHECKS){
            localStorage.setItem(Config.localStorageKey.dashboardTourCompleted, "true")
            driverObj.drive()
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
                    driverObj.destroy()
                    openCreateShotlistDialog()
                }}>
                    <span><Plus/>New Shotlist</span>
                </button>
            </DashboardGrid>
            <h2>Templates</h2>
            <DashboardGrid>
                {templates.slice(0, 8)?.sort(Utils.orderShotlistsOrTemplatesByName)?.map((template: TemplateDto) => (
                    <DashboardGridTemplate template={template} key={template.id}/>
                ))}
                <button className={"dashboardGridItem add"} onClick={openCreateTemplateDialog}>
                    <span><Plus/>New Template</span>
                </button>
            </DashboardGrid>

            {CreateShotlistDialog}
            {CreateTemplateDialog}
        </main>
    );
}
