'use client'

import gql from "graphql-tag"
import Link from "next/link"
import {ApolloError, ApolloQueryResult, useApolloClient, useQuery, useSuspenseQuery} from "@apollo/client"
import "./dashboard.scss"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import React, {useEffect, useState} from "react"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import {
    Blocks,
    NotepadText,
    Plus,
} from "lucide-react"
import {Query, ShotlistDto, TemplateDto} from "../../../lib/graphql/generated"
import {wuGeneral, wuTime} from "@yanikkendler/web-utils"
import {useRouter, useSearchParams} from "next/navigation"
import {useCreateShotlistDialog} from "@/components/dialogs/createShotlistDialog/createShotlistDialog"
import Utils, {Config} from "@/util/Utils"
import {useCreateTemplateDialog} from "@/components/dialogs/createTemplateDialog/createTemplateDialog"
import * as Dialog from "@radix-ui/react-dialog"
import {driver} from "driver.js"
import "driver.js/dist/driver.css";
import Skeleton from "react-loading-skeleton"
import auth from "@/Auth"

export default function Overview() {
    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

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
        if (justBoughtPro) {
            setJustBoughtProDialogOpen(true)
        }

        loadData()

        if(localStorage.getItem(Config.localStorageKey.dashboardTourCompleted) != "true") {
            localStorage.setItem(Config.localStorageKey.dashboardTourCompleted, "true")
            driverObj.drive()
        }
    }, []);

    const loadData = async () => {
        try {
            const result = await client.query({
                query: gql`
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

            setQuery(result)

            setShotlists(result.data.shotlists)
            setTemplates(result.data.templates)
        }
        catch (error) {
            setQuery({...query, error: error as ApolloError})
        }
    }

    function handleJustBoughtProDialogOpenChange(newOpen: boolean) {
        setJustBoughtProDialogOpen(newOpen)
        router.replace("/dashboard")
    }

    if(query.error) return (
        <ErrorPage
            title='Data could not be loaded'
            description={query.error.message}
            link= {{
                text: 'Dashboard',
                href: '../dashboard'
            }}
        />
    )

    if(query.errors) return (
        <ErrorPage
            title='Data could not be loaded'
            description={query.errors.map(e => e.message).join(", ")}
            link= {{
                text: 'Dashboard',
                href: '../dashboard'
            }}
        />
    )

    if(query.loading) return (
        <main className="overview dashboardContent">
            <h2>Shotlists</h2>
            <div className="grid">
                <Skeleton height={150}/>
                <Skeleton height={150}/>
            </div>
            <h2>Templates</h2>
            <div className="grid">
                <Skeleton height={150}/>
                <Skeleton height={150}/>
            </div>
        </main>
    )

    return (
        <main className="overview dashboardContent">
            <h2>Shotlists</h2>
            <div className="grid">
                {shotlists.sort(Utils.oderShotlistsByChangeDate).map((shotlist: ShotlistDto) => (
                    <Link href={`/shotlist/${shotlist.id}`} key={shotlist.id} className="gridItem shotlist">
                        <div className="top">
                            <NotepadText size={18}/>
                            <h3>{shotlist.name || <span className='italic'>Unnamed</span>}</h3>
                        </div>
                        <p className={"bold"}>{shotlist.sceneCount} scene • {shotlist.shotCount} shots</p>
                        <p>created by: <span className={"bold"}>{shotlist.owner?.name}</span></p>
                        <p>last edited: <span className={"bold"}>{wuTime.toRelativeString(shotlist.editedAt, 1)}</span></p>
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
                        <div className="top">
                            <Blocks size={18}/>
                            <h3>{template.name || <span className='italic'>Unnamed</span>}</h3>
                        </div>
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
