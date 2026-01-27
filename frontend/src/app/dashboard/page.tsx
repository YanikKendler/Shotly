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
import Config from "@/util/Config"
import {useCreateTemplateDialog} from "@/components/dialogs/createTemplateDialog/createTemplateDialog"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Skeleton from "react-loading-skeleton"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"

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
                description: 'If someone invites you to their shotlist the request will be visible under "Collab-Requests". Using the "Account" button you can modify your account and change your settings.',
                side: "right",
                align: 'center'
            }},
/*
            { element: '.sidebar .template', popover: { description: 'You can use it when creating your first shotlist to start with a default attribute for shots and scenes.', side: "right", align: 'center' }},
*/
            { element: '.gridItem.add.shotlist', popover: { description: 'Click here to create a new Shotlist.', side: "bottom", align: 'center' }},
        ],
        onDestroyed: () => {
            dashboardContext.incrementDialogStep()
        },
    })

    //dashboard tour
    useEffect(() => {
        if(dashboardContext.dialogStep != DialogStep.TOUR) return;

        if(localStorage.getItem(Config.localStorageKey.dashboardTourCompleted) != "true") {
            localStorage.setItem(Config.localStorageKey.dashboardTourCompleted, "true")
            driverObj.drive()
        }
        else{
            dashboardContext.incrementDialogStep()
            console.log("skipping dashboard tour dialog")
        }
    }, [dashboardContext.dialogStep])

    useEffect(() => {
        if(!dashboardContext.query || !dashboardContext.query.data || !dashboardContext.query.data.shotlists) return;

        const newShotlists = [
            ...dashboardContext.query.data.shotlists.personal || [],
            ...dashboardContext.query.data.shotlists.shared || []
        ]

        setShotlists((newShotlists as ShotlistDto[]).sort(Utils.oderShotlistsByChangeDate))
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
            <div className="grid">
                <Skeleton height={130}/>
                <Skeleton height={130}/>
            </div>
            <h2>Templates</h2>
            <div className="grid">
                <Skeleton height={130}/>
                <Skeleton height={130}/>
            </div>
        </main>
    )

    return (
        <main className="overview dashboardContent">
            <h2>Shotlists</h2>
            <div className="grid">
                {shotlists.map((shotlist: ShotlistDto) => (
                    <Link href={`/shotlist/${shotlist.id}`} key={shotlist.id} className="gridItem shotlist">
                        <SimpleTooltip text={shotlist.name || "Unnamed"}>
                            <div className="top">
                                <NotepadText size={18}/>
                                <h3>{shotlist.name || <span className='italic'>Unnamed</span>}</h3>
                            </div>
                        </SimpleTooltip>
                        <p className={"bold"}>
                            {shotlist.sceneCount} scene{shotlist.sceneCount && shotlist.sceneCount === 1 ? "" : "s"}
                            {" • "}
                            {shotlist.shotCount} shot{shotlist.shotCount && shotlist.shotCount === 1 ? "" : "s"}
                        </p>
                        <p>Created by: <span className={"bold"}>{shotlist.owner?.name}</span></p>
                        <p>Last edited: <span className={"bold"}>{wuTime.toRelativeString(shotlist.editedAt, {precision: 1, separator: ":"}) || "Unkown"}</span></p>
                    </Link>
                ))}
                <button className={"gridItem add shotlist"} onClick={() => {
                    driverObj.destroy()
                    openCreateShotlistDialog()
                }}>
                    <span><Plus/>New Shotlist</span>
                </button>
            </div>
            <h2>Templates</h2>
            <div className="grid">
                {templates.sort(Utils.orderShotlistsOrTemplatesByName).map((template: TemplateDto) => (
                    <Link href={`dashboard/template/${template.id}`} key={template.id} className="gridItem template">
                        <SimpleTooltip text={template.name || "Unnamed"}>
                            <div className="top">
                                <Blocks size={18}/>
                                <h3>{template.name || <span className='italic'>Unnamed</span>}</h3>
                            </div>
                        </SimpleTooltip>
                        <p>
                            {"Scenes: "}
                            <span className={"bold"}>
                                {template.sceneAttributeCount} Attribute{template.sceneAttributeCount && template.sceneAttributeCount === 1 ? "" : "s"}
                            </span>
                        </p>
                        <p>
                            {"Shots: "}
                            <span className={"bold"}>
                                {template.shotAttributeCount} Attribute{template.shotAttributeCount && template.shotAttributeCount === 1 ? "" : "s"}
                            </span>
                        </p>
                        <p>Created by: <span className={"bold"}>{template.owner?.name}</span></p>
                    </Link>
                ))}
                <button className={"gridItem add"} onClick={openCreateTemplateDialog}>
                    <span><Plus/>New Template</span>
                </button>
            </div>

            {CreateShotlistDialog}
            {CreateTemplateDialog}
        </main>
    );
}
