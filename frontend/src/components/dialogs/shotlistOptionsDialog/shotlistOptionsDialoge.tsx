'use client';

import * as Dialog from '@radix-ui/react-dialog';
import React, {useEffect, useState} from 'react';
import "./shotlistOptionsDialog.scss"
import {Popover, Separator, Tabs, VisuallyHidden} from "radix-ui"
import {ChevronDown, File, FileDown, List, Plus, Type, Users, X, ListOrdered, Settings, Settings2} from "lucide-react"
import {
    AnySceneAttributeDefinition,
    AnyShotAttributeDefinition,
} from "@/util/Types"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import { ShotlistDto } from "../../../../lib/graphql/generated"
import {useRouter} from "next/navigation"
import ExportTab from "@/components/dialogs/shotlistOptionsDialog/exportTab/exportTab"
import GeneralTab from "@/components/dialogs/shotlistOptionsDialog/generalTab/generalTab"
import AttributeTab from "@/components/dialogs/shotlistOptionsDialog/attributeTab/attributeTab"
import CollaboratorsTab from "@/components/dialogs/shotlistOptionsDialog/collaboratorsTab/collaboratorsTab"

export type ShotlistOptionsDialogPage = "general" | "attributes" | "collaborators" | "export"

export type ShotlistOptionsDialogSubPage = "shot" | "scene"

export default function ShotlistOptionsDialog({isOpen, setIsOpen, selectedPage, shotlistId, refreshShotlist}:
{
    isOpen: boolean,
    setIsOpen: any,
    selectedPage: { main: ShotlistOptionsDialogPage, sub: ShotlistOptionsDialogSubPage },
    shotlistId: string | null,
    refreshShotlist: () => void
}) {
    const [sceneAttributeDefinitions, setSceneAttributeDefinitions] = useState<AnySceneAttributeDefinition[] | null>(null);
    const [shotAttributeDefinitions, setShotAttributeDefinitions] = useState<AnyShotAttributeDefinition[] | null>(null);
    const [shotlist, setShotlist] = useState<ShotlistDto | null>(null);
    // used for refreshing the shotlist on dialog close, only when any data has been edited
    const [stringifiedAttributeData, setStringifiedAttributeData] = useState<string>("");
    const [dataChanged, setDataChanged] = useState(false);

    const [isReadOnly, setIsReadOnly] = useState(false);

    const client = useApolloClient()
    const router = useRouter()

    useEffect(() => {
        if(!shotlistId) return

        loadData()
        setDataChanged(false)
    }, [shotlistId, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setStringifiedAttributeData(JSON.stringify(shotAttributeDefinitions) + JSON.stringify(sceneAttributeDefinitions) + JSON.stringify(shotlist));
        }
        updateUrl(selectedPage.main)
    }, [isOpen]);

    const updateUrl = (page?: ShotlistOptionsDialogPage) => {
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

    const loadData = async () => {
        //TODO not getting the options

        const { data, errors, loading } = await client.query({query: gql`
                query data($shotlistId: String!){
                    shotlist(id: $shotlistId){
                        id
                        name
                        sceneCount
                        shotCount
                        editedAt
                        createdAt
                        owner {
                            name
                            tier
                            shotlistCount
                        }
                        shotAttributeDefinitions{
                            id
                            name
                            position
    
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
                        sceneAttributeDefinitions{
                            id
                            name
                            position
    
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
                    }
                }`,
            variables: {shotlistId: shotlistId},
            fetchPolicy: "no-cache",
            },
        )

        if(data.shotlist?.owner?.tier == "BASIC" && data.shotlist.owner.shotlistCount > 1) {
            setIsReadOnly(true)
        }

        setSceneAttributeDefinitions(data.shotlist.sceneAttributeDefinitions)
        setShotAttributeDefinitions(data.shotlist.shotAttributeDefinitions)
        setShotlist(data.shotlist)

        setStringifiedAttributeData(JSON.stringify(data.shotlist.shotAttributeDefinitions) + JSON.stringify(data.shotlist.sceneAttributeDefinitions) + JSON.stringify(data.shotlist))
    }

    function runRefreshShotlistCheck(){
        let currentAttributeData = JSON.stringify(shotAttributeDefinitions) + JSON.stringify(sceneAttributeDefinitions) + JSON.stringify(shotlist)

        if(dataChanged || currentAttributeData != stringifiedAttributeData) {
            refreshShotlist()
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(isOpen: boolean) => {
            setIsOpen(isOpen)
            updateUrl()
            runRefreshShotlistCheck()
        }}>
            <Dialog.Portal>
                <Dialog.Overlay className={"shotlistOptionsDialogOverlay dialogOverlay"}/>
                <Dialog.Content aria-describedby={"confirm action dialog"} className={"shotlistOptionsDialogContent dialogContent"}>
                    <VisuallyHidden.Root>
                        <Dialog.Title className={"title"}>Shotlist Options</Dialog.Title>
                        <Dialog.Description className={"description"}>Edit attributes and collaborators or export a shotlist.</Dialog.Description>
                    </VisuallyHidden.Root>

                    <div className="content">
                        <button className={"closeButton"} onClick={() => {
                            setIsOpen(false)
                            runRefreshShotlistCheck()
                        }}>
                            <X size={18}/>
                        </button>
                        <Tabs.Root className={"optionsDialogPageTabRoot"} defaultValue={selectedPage.main} onValueChange={page => updateUrl(page as ShotlistOptionsDialogPage)}>
                            <Tabs.List className={"tabs"}>
                                <Tabs.Trigger value={"general"}>
                                    <Settings2 size={18} strokeWidth={2}/>
                                    General
                                </Tabs.Trigger>
                                <Tabs.Trigger value={"attributes"}>
                                    <List size={18} strokeWidth={2}/>
                                    Attributes
                                </Tabs.Trigger>
                                {/*<Tabs.Trigger value={"collaborators"}>
                                    <Users size={18} strokeWidth={2}/>
                                    Collaborators
                                </Tabs.Trigger>*/}
                                <Tabs.Trigger value={"export"}>
                                    <FileDown size={18} strokeWidth={2}/>
                                    Export
                                </Tabs.Trigger>
                            </Tabs.List>
                            <Separator.Root
                                className="Separator vertical"
                                orientation="vertical"
                            />
                            <Separator.Root
                                className="Separator horizontal"
                                orientation="horizontal"
                            />
                            <Tabs.Content value={"general"} className={"content"}>
                                <GeneralTab
                                    shotlist={shotlist}
                                    setShotlist={setShotlist}
                                    dataChanged={() => setDataChanged(true)}
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
                                        selectedPage={selectedPage.sub}
                                        dataChanged={() => setDataChanged(true)}
                                    />
                                }
                            </Tabs.Content>
                            <Tabs.Content value={"collaborators"} className={"content"}>
                                {
                                    isReadOnly ?
                                        <p className={"empty"}>Sorry, this shotlist is in read-only Mode.</p> :
                                        <CollaboratorsTab/>
                                }
                            </Tabs.Content>
                            <Tabs.Content value={"export"} className={"content"}>
                                <ExportTab shotlist={shotlist}/>
                            </Tabs.Content>
                        </Tabs.Root>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
