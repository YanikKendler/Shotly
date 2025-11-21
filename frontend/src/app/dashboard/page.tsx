'use client'

import gql from "graphql-tag"
import Link from "next/link"
import {useApolloClient, useQuery, useSuspenseQuery} from "@apollo/client"
import "./dashboard.scss"
import LoadingPage from "@/pages/loadingPage/loadingPage"
import React, {useEffect, useState} from "react"
import ErrorPage from "@/pages/errorPage/errorPage"
import {ChevronDown, House, NotepadText, NotepadTextDashed, Plus, User} from "lucide-react"
import {ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {wuGeneral, wuTime} from "@yanikkendler/web-utils"
import {useRouter, useSearchParams} from "next/navigation"
import {useCreateShotlistDialog} from "@/components/dialog/createShotlistDialog/createShotlistDialog"
import {useAccountDialog} from "@/components/dialog/accountDialog/accountDialog"
import Utils from "@/util/Utils"
import {useCreateTemplateDialog} from "@/components/dialog/createTemplateDialog/createTemplateDialog"
import auth from "@/Auth"
import * as Dialog from "@radix-ui/react-dialog"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Loader from "@/components/loader/loader"

export default function Overview() {
    const [query, setQuery] = useState<{ error: any, loading: boolean }>({error: null, loading: true})

    const [shotlists, setShotlists] = useState<ShotlistDto[]>([])
    const [templates, setTemplates] = useState<TemplateDto[]>([])

    const client = useApolloClient()
    const router = useRouter()

    const searchParams = useSearchParams()
    const justBoughtPro = searchParams?.get('jbp') === 'true'
    const [justBoughtProDialogOpen, setJustBoughtProDialogOpen] = useState<boolean>(justBoughtPro)

    const { openCreateShotlistDialog, CreateShotlistDialog } = useCreateShotlistDialog()
    const { openCreateTemplateDialog, CreateTemplateDialog } = useCreateTemplateDialog()

    const driverObj = driver({
        showProgress: true,
        allowClose: true,
        steps: [
            { popover: { title: 'Welcome to Shotly', description: 'You will now get a quick tour of the Dashboard' } },
            { element: '.sidebar', popover: { title: 'The Sidebar', description: 'Here you see all your shotlists and Templates. You currently dont have any shotlists, but a default Template was automatically created!', side: "right", align: 'center' }},
/*
            { element: '.sidebar .template', popover: { description: 'You can use it when creating your first shotlist to start with a default attribute for shots and scenes.', side: "right", align: 'center' }},
*/
            { element: '.gridItem.add.shotlist', popover: { description: 'Click here to create a new Shotlist.', side: "bottom", align: 'center' }},
        ]
    })

    useEffect(() => {
        loadData()

        if (justBoughtPro) {
            setJustBoughtProDialogOpen(true)
        }

        if(localStorage["shotly-dashboard-tour-completed"] != "true") {
            localStorage["shotly-dashboard-tour-completed"] = "true"
            driverObj.drive()
        }
    }, []);

    const loadData = async () => {
        console.time("loadData")
        const { data, error, loading } = await client.query({query: gql`
                query dashboard{
                    shotlists{
                        id
                        name
                        sceneCount
                        shotCount
                        editedAt
                        owner {
                            name
                        }
                    }
                    templates {
                        id
                        name
                        shotAttributeCount
                        sceneAttributeCount
                        owner {
                            name
                        }
                    }
                }`,
            fetchPolicy: "no-cache",
            errorPolicy: "all"
        })

        //console.log(data)

        setQuery({error, loading})

        setShotlists(data.shotlists)
        setTemplates(data.templates)

        console.timeEnd("loadData")
    }

    function handleJustBoughtProDialogOpenChange(newOpen: boolean) {
        setJustBoughtProDialogOpen(newOpen)
        router.replace("/dashboard")
    }

    if(query.error) return <ErrorPage settings={{
        title: 'Data could not be loaded',
        description: query.error.message,
        link: {
            text: 'Dashboard',
            href: '../dashboard'
        }
    }}/>
    if(query.loading) return <LoadingPage text={"loading shotlists"} className={"dashboardContent"}/>

    return (
        <main className="overview dashboardContent">
            <h2>Shotlists</h2>
            <div className="grid">
                {shotlists.sort(Utils.oderShotlistsByChangeDate).map((shotlist: ShotlistDto) => (
                    <Link href={`/shotlist/${shotlist.id}`} key={shotlist.id} className="gridItem shotlist">
                        <label><NotepadText size={15}/>Shotlist</label>
                        <h3>{shotlist.name || <span className='italic'>Unnamed</span>}</h3>
                        <p className={"bold"}>{shotlist.sceneCount} scene • {shotlist.shotCount} shots</p>
                        <p>created by: <span className={"bold"}>{shotlist.owner?.name}</span></p>
                        <p>last edited: <span
                            className={"bold"}>{wuTime.toFullTimeString(shotlist.editedAt) /*TODO fix timestamp*/} ago</span></p>
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
                        <label><NotepadTextDashed size={15}/>Template</label>
                        <h3>{template.name || <span className='italic'>Unnamed</span>}</h3>
                        <p>Shots: <span className={"bold"}>{template.shotAttributeCount} Attributes</span></p>
                        <p>Scenes: <span className={"bold"}>{template.sceneAttributeCount} Attributes</span></p>
                        <p>created by: <span className={"bold"}>{template.owner?.name}</span></p>
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
                        <button onClick={event => handleJustBoughtProDialogOpenChange(false)}>Start creating</button>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            {CreateShotlistDialog}
            {CreateTemplateDialog}
        </main>
    );
}
