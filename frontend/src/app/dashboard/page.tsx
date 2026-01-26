'use client'

import gql from "graphql-tag"
import Link from "next/link"
import {ApolloError, ApolloQueryResult, useApolloClient, useQuery, useSuspenseQuery} from "@apollo/client"
import "./dashboard.scss"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import React, {useContext, useEffect, useState} from "react"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import {
    Blocks,
    NotepadText,
    Plus,
} from "lucide-react"
import {Query, ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {wuConstants, wuGeneral, wuTime} from "@yanikkendler/web-utils"
import {useRouter, useSearchParams} from "next/navigation"
import {useCreateShotlistDialog} from "@/components/dialogs/createShotlistDialog/createShotlistDialog"
import Utils from "@/util/Utils"
import Config from "@/util/Config"
import {useCreateTemplateDialog} from "@/components/dialogs/createTemplateDialog/createTemplateDialog"
import * as Dialog from "@radix-ui/react-dialog"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Skeleton from "react-loading-skeleton"
import auth from "@/Auth"
import {DashboardContext} from "@/context/DashboardContext"
import TextField from "@/components/inputs/textField/textField"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import {errorNotification} from "@/service/NotificationService"

export default function Overview() {
    const client = useApolloClient()
    const router = useRouter()
    const dashboardContext = useContext(DashboardContext)

    const [shotlists, setShotlists] = useState<ShotlistDto[]>([])
    const [templates, setTemplates] = useState<TemplateDto[]>([])

    const searchParams = useSearchParams()
    const justBoughtPro = searchParams?.get('jbp') === 'true'
    const [justBoughtProDialogOpen, setJustBoughtProDialogOpen] = useState<boolean>(justBoughtPro)

    const [enterNameDialogOpen, setEnterNameDialogOpen] = useState(false)
    const [newName, setNewName] = useState<string>("")

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
        ]
    })

    useEffect(() => {
        if (justBoughtPro) {
            setJustBoughtProDialogOpen(true)
        }
    }, []);

    useEffect(() => {
        const email = dashboardContext.query.data.currentUser?.email
        const name = dashboardContext.query.data.currentUser?.name
        if(name && email && name == email){
            setEnterNameDialogOpen(true)
            return
        }

        checkAndShowIntroduction()
    }, [dashboardContext.query.data.currentUser]);

    useEffect(() => {
        if(!dashboardContext.query || !dashboardContext.query.data || !dashboardContext.query.data.shotlists) return;

        const newShotlists = [
            ...dashboardContext.query.data.shotlists.personal || [],
            ...dashboardContext.query.data.shotlists.shared || []
        ]

        setShotlists((newShotlists as ShotlistDto[]).sort(Utils.oderShotlistsByChangeDate))
        setTemplates(dashboardContext.query.data.templates as TemplateDto[])
    }, [dashboardContext.query]);

    const checkAndShowIntroduction = () => {
        if(localStorage.getItem(Config.localStorageKey.dashboardTourCompleted) != "true") {
            localStorage.setItem(Config.localStorageKey.dashboardTourCompleted, "true")
            driverObj.drive()
        }
    }

    const handleJustBoughtProDialogOpenChange = (newOpen: boolean)=> {
        setJustBoughtProDialogOpen(newOpen)
        router.replace("/dashboard")
    }

    const handleNewUserName = async () => {
        if(wuConstants.Regex.empty.test(newName)) return

        const {data, errors} = await client.mutate({
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
        )

        if(errors) {
            errorNotification({
                title: "Failed to update Username",
                sub: "Please contact yanik@shotly.at or try again later"
            })
            console.error("Error updating username:", errors);
            return;
        }

        setEnterNameDialogOpen(false)

        checkAndShowIntroduction()
    }

    if(dashboardContext.query.error) return (
        <ErrorPage
            title='Data could not be loaded'
            description={dashboardContext.query.error.message}
            reload
            noLink
        />
    )

    if(dashboardContext.query.errors) return (
        <ErrorPage
            title='Data could not be loaded'
            description={dashboardContext.query.errors.map(e => e.message).join(", ")}
            reload
            noLink
        />
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

            <Dialog.Root open={justBoughtProDialogOpen} onOpenChange={handleJustBoughtProDialogOpenChange}>
                <Dialog.Portal>
                    <Dialog.Overlay className={"dialogOverlay"}/>
                    <Dialog.Content
                        aria-describedby={"just bought pro dialog"}
                        className={"justBoughtProDialogContent dialogContent"}

                    >
                        <Dialog.Title className={"title"}>Thank you for subscribing to Shotly Pro!</Dialog.Title>
                        <p className={"financing"}>You are financing the development and server costs of Shotly, I am very grateful for that.</p>
                        <p className={"issues"}>I hope you are satisfied with your Purchase! If you do however encounter any problems, please open an issue via the account tab.</p>
                        <button onClick={() => handleJustBoughtProDialogOpenChange(false)}>Start creating</button>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={enterNameDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className={"dialogOverlay"}/>
                    <Dialog.Content
                        aria-describedby={"enter name dialog"}
                        className={"enterNameDialogContent dialogContent"}
                    >
                        <Dialog.Title className={"title"}>Welcome to Shotly!</Dialog.Title>
                        <p>
                            <span className="bold">Please enter your name (or nickname) to continue.</span>
                            <br/>
                            <span className="gray">This name will be visible to all collaborators and can not be used to log in.</span>
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
                            onClick={handleNewUserName}
                        >
                            Done
                        </button>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {CreateShotlistDialog}
            {CreateTemplateDialog}
        </main>
    );
}
