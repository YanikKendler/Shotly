'use client';

import React, {RefObject, useEffect, useRef, useState} from 'react';
import "./shotlistOptionsDialog.scss"
import {Tabs, VisuallyHidden} from "radix-ui"
import {FileDown, List, Users, X, Settings2} from "lucide-react"
import {
    AnySceneAttributeDefinition,
    AnyShotAttributeDefinition,
} from "@/util/Types"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {CollaborationDto, ShotlistDto, UserDto} from "../../../../lib/graphql/generated"
import {useRouter} from "next/navigation"
import ExportTab from "@/components/dialogs/shotlistOptionsDialog/exportTab/exportTab"
import GeneralTab from "@/components/dialogs/shotlistOptionsDialog/generalTab/generalTab"
import AttributeTab from "@/components/dialogs/shotlistOptionsDialog/attributeTab/attributeTab"
import CollaboratorsTab from "@/components/dialogs/shotlistOptionsDialog/collaboratorsTab/collaboratorsTab"
import Separator from "@/components/separator/separator"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialog"
import {errorNotification} from "@/service/NotificationService"
import Dialog, {DialogRef} from "@/components/dialog/dialog"

export enum ShotlistOptionsDialogPage {
    general = "general",
    attributes = "attributes",
    collaborators = "collaborators",
    export = "export"
}

export const ShotlistOptionsDialogPageValues: string[] = Object.values(ShotlistOptionsDialogPage)

export enum ShotlistOptionsDialogSubPage {
    shot = "shot",
    scene = "scene"
}

export const ShotlistOptionsDialogSubPageValues: string[] = Object.values(ShotlistOptionsDialogSubPage)

export default function ShotlistOptionsDialog({
    ref,
    selectedPage,
    shotlistId,
    refreshShotlist,
    isReadOnly
}: {
    ref: RefObject<DialogRef | null>
    selectedPage: { main: ShotlistOptionsDialogPage, sub: ShotlistOptionsDialogSubPage } | null,
    shotlistId: string | null,
    refreshShotlist: () => void,
    isReadOnly: boolean,
}) {
    const [sceneAttributeDefinitions, setSceneAttributeDefinitions] = useState<AnySceneAttributeDefinition[] | null>(null);
    const [shotAttributeDefinitions, setShotAttributeDefinitions] = useState<AnyShotAttributeDefinition[] | null>(null);
    const [shotlist, setShotlist] = useState<ShotlistDto | null>(null);
    const [collaborations, setCollaborations] = useState<CollaborationDto[] | null>(null)
    const [currentUser, setCurrentUser] = useState<UserDto | null>(null)
    // used for refreshing the shotlist on dialog close, only when any data has been edited
    const [stringifiedAttributeData, setstringifiedAttributeData] = useState<string>("");
    const [dataChanged, setDataChanged] = useState(false);
    const [selectedMainPage, setSelectedMainPage] = useState<ShotlistOptionsDialogPage>(ShotlistOptionsDialogPage.general);
    const [selectedSubPage, setSelectedSubPage] = useState<ShotlistOptionsDialogSubPage>(ShotlistOptionsDialogSubPage.scene);

    const client = useApolloClient()
    const router = useRouter()
    const {confirm, ConfirmDialog} = useConfirmDialog()

    const checkUrlAutoOpen = () => {
        const url = new URL(window.location.href)
        if(url.searchParams.get("oo") == "true") {
            ref.current?.open()

            const mpParam = url.searchParams.get("mp")
            const spParam = url.searchParams.get("sp")

            if(mpParam && ShotlistOptionsDialogPageValues.includes(mpParam)) {
                setSelectedMainPage(ShotlistOptionsDialogPage[mpParam as keyof typeof ShotlistOptionsDialogPage])

                if(spParam && ShotlistOptionsDialogSubPageValues.includes(spParam)) {
                    setSelectedSubPage(ShotlistOptionsDialogSubPage[spParam as keyof typeof ShotlistOptionsDialogSubPage])
                }
            }
            else {
                setSelectedMainPage(ShotlistOptionsDialogPage.general)
            }
        }
    }

    useEffect(() => {
        if(selectedPage) {
            setSelectedMainPage(selectedPage.main)
            setSelectedSubPage(selectedPage.sub)
        }
    }, [selectedPage]);

    const loadData = async () => {
        //fetching the defintions separately because im lazy and the shotlist query doesnt actually return the options hehe
        const result = await client.query({query: gql`
                query data($shotlistId: String!){
                    shotlist(id: $shotlistId){
                        id
                        name
                        template {
                            name
                        }
                        sceneCount
                        shotCount
                        editedAt
                        createdAt
                        owner {
                            id
                            name
                            tier
                            shotlistCount
                        }
                        collaborations {
                            id
                            user {
                                id
                                email
                                name
                                auth0Sub
                            }
                            collaborationState
                            collaborationType
                        }
                    }
                    shotAttributeDefinitions(shotlistId: $shotlistId){
                        id
                        name
                        position
                        type

                        ... on ShotSingleSelectAttributeDefinitionDTO{
                            options{
                                id
                                name
                            }
                        }

                        ... on ShotMultiSelectAttributeDefinitionDTO{
                            options {
                                id
                                name
                            }
                        }
                    }
                    sceneAttributeDefinitions(shotlistId: $shotlistId){
                        id
                        name
                        position
                        type

                        ... on SceneSingleSelectAttributeDefinitionDTO{
                            options{
                                id
                                name
                            }
                        }

                        ... on SceneMultiSelectAttributeDefinitionDTO{
                            options{
                                id
                                name
                            }
                        }
                    }
                    currentUser {
                        id
                    }
                }`,
            variables: {shotlistId: shotlistId},
            fetchPolicy: "no-cache",
            },
        )

        if(result.errors){
            errorNotification({
                title: "Failed to load shotlist data",
                tryAgainLater: true
            })
            console.error(result.errors)
            return
        }

        setSceneAttributeDefinitions(result.data.sceneAttributeDefinitions)
        setShotAttributeDefinitions(result.data.shotAttributeDefinitions)
        setShotlist(result.data.shotlist)
        //is its own state to not influence he refresh check (data stringification)
        setCollaborations(result.data.shotlist.collaborations)
        setCurrentUser(result.data.currentUser)

        setstringifiedAttributeData(
            JSON.stringify(result.data.shotAttributeDefinitions) +
            JSON.stringify(result.data.sceneAttributeDefinitions) +
            JSON.stringify(result.data.shotlist)
        )
    }

    const leaveCollaboration = async () => {
        if(!shotlistId) return

        let decision = await confirm({
            title: "Are you sure?",
            message: `You will loose access to the Shotlist "${shotlist?.name || "Unnamed"}" until its owner invites you again."`,
            buttons: {
                confirm: {
                    className: "bad",
                }
            }
        })

        if(!decision) return

        const result = await client.mutate({
            mutation: gql`
                mutation leaveCollaboration($shotlistId: String!){
                    leaveCollaboration(shotlistId: $shotlistId){
                        id
                    }
                }`,
            variables: {shotlistId: shotlistId}
        })

        if(result.errors){
            errorNotification({
                title: "Failed to leave collaboration",
                tryAgainLater: true
            })
            console.error("Error leaving collaboration:", result.errors)
            return
        }

        router.push("/dashboard")
    }

    const updateUrl = (isOpen: boolean, page?: ShotlistOptionsDialogPage) => {
        const url = new URL(window.location.href)
        if(isOpen){
            url.searchParams.set("oo", "true") // options open
            if(page)
                url.searchParams.set("mp", page) // main page
        }
        else {
            url.searchParams.delete("oo") // options open
            url.searchParams.delete("mp") // main page
            url.searchParams.delete("sp") // sub page
        }

        router.push(url.toString())
    }

    function runRefreshShotlistCheck(){
        let currentAttributeData = JSON.stringify(shotAttributeDefinitions) + JSON.stringify(sceneAttributeDefinitions) + JSON.stringify(shotlist)

        if(dataChanged || currentAttributeData != stringifiedAttributeData) {
            refreshShotlist()
        }
    }

    return (
        <>
        <Dialog
            onOpenChange={(isOpen: boolean) => {
                updateUrl(isOpen)

                if(isOpen) {
                    if (shotlistId) {
                        loadData()
                        setDataChanged(false)
                    }
                }
                else {
                    runRefreshShotlistCheck()
                }
            }}
            onRenderFinish={checkUrlAutoOpen}
            ref={ref}
            contentClassName={"shotlistOptionsDialogContent"}
        >
            <button className={"closeButton"} onClick={ref.current?.close}>
                <X size={18}/>
            </button>
            <Tabs.Root
                className={"optionsDialogPageTabRoot"}
                value={selectedMainPage}
                onValueChange={page => {
                    setSelectedMainPage(page as ShotlistOptionsDialogPage)
                    updateUrl(true, page as ShotlistOptionsDialogPage)
                }}
            >
                <Tabs.List className={"tabs"}>
                    <Tabs.Trigger value={"general"}>
                        <Settings2 size={18} strokeWidth={2}/>
                        General
                    </Tabs.Trigger>
                    <Tabs.Trigger value={"attributes"}>
                        <List size={18} strokeWidth={2}/>
                        Attributes
                    </Tabs.Trigger>
                    <Tabs.Trigger value={"collaborators"}>
                        <Users size={18} strokeWidth={2}/>
                        Collaborators
                    </Tabs.Trigger>
                    <Tabs.Trigger value={"export"}>
                        <FileDown size={18} strokeWidth={2}/>
                        Export
                    </Tabs.Trigger>
                </Tabs.List>
                <Separator orientation={"vertical"}/>
                <Separator orientation={"horizontal"}/>
                <Tabs.Content value={"general"} className={"content"}>
                    <GeneralTab
                        shotlist={shotlist}
                        setShotlist={setShotlist}
                        dataChanged={() => setDataChanged(true)}
                        isReadOnly={isReadOnly}
                        currentUser={currentUser}
                    />
                </Tabs.Content>
                <Tabs.Content value={"attributes"} className={"content"}>
                    {
                        isReadOnly ?
                        <p className={"empty"}>Sorry, this shotlist is in read-only Mode.</p> :
                        <AttributeTab
                            shotlistId={shotlistId}
                            shotAttributeDefinitions={shotAttributeDefinitions}
                            setShotAttributeDefinitions={setShotAttributeDefinitions}
                            sceneAttributeDefinitions={sceneAttributeDefinitions}
                            setSceneAttributeDefinitions={setSceneAttributeDefinitions}
                            selectedPage={selectedSubPage}
                            setSelectedPage={setSelectedSubPage}
                            dataChanged={() => setDataChanged(true)}
                        />
                    }
                </Tabs.Content>
                <Tabs.Content value={"collaborators"} className={"content"}>
                    {
                        shotlist?.owner?.id != currentUser?.id ?
                        <>
                            <div className="collabNotOwner">
                                <h2>Collaboration</h2>
                                <div className="row">
                                    <p>Leave this Shotlist</p>
                                    <button
                                        className="bad"
                                        onClick={leaveCollaboration}
                                    >
                                        Leave
                                    </button>
                                </div>
                                <p className={"empty"}>
                                    As a collaborator, you don’t have permission to edit collaborators.
                                </p>
                            </div>
                        </> :

                        <CollaboratorsTab
                            shotlistId={shotlistId}
                            collaborations={collaborations}
                            setCollaborations={setCollaborations}
                        />
                    }
                </Tabs.Content>
                {/*keep the tab mounted so that the selected filters don't disappear when switching tabs*/}
                <Tabs.Content
                    value={"export"}
                    className={"content"}
                    forceMount={true}
                    style={{display: selectedMainPage == "export" ? "block" : "none"}}
                >
                    <ExportTab
                        shotlist={shotlist}
                        shotAttributeDefinitions={shotAttributeDefinitions}
                        sceneAttributeDefinitions={sceneAttributeDefinitions}
                    />
                </Tabs.Content>
            </Tabs.Root>
        </Dialog>
        {ConfirmDialog}
        </>
    );
}
