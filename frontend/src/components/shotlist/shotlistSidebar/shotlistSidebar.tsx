import Iconmark from "@/components/iconmark"
import {FileSliders, House, Plus, User } from "lucide-react"
import Link from "next/link"
import { Tooltip } from "radix-ui"
import {Query, SceneDto, ShotlistDto} from "../../../../lib/graphql/generated"
import gql from "graphql-tag"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {wuGeneral} from "@yanikkendler/web-utils"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import ErrorDisplay from "@/components/feedback/errorDisplay/errorDisplay"
import SidebarScene from "@/components/shotlist/shotlistSidebar/sidebarScene/sidebarScene"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import React from "react"
import Utils from "@/util/Utils"
import {useParams} from "next/navigation"
import {useAccountDialog} from "@/components/dialogs/accountDialog/accountDialog"

export default function shotlistSidebar({
    query,
    selectScene,
    setQuery,
    selectedSceneId,
    setSelectedSceneId,
    sceneCount,
    setSceneCount,
    isReadOnly,
    setSidebarOpen,
    openShotlistOptionsDialog
}: {
    query: ApolloQueryResult<Query>
    selectScene: (id: string) => void
    setQuery: (query: ApolloQueryResult<Query>) => void
    selectedSceneId: string
    setSelectedSceneId: (id: string) => void
    sceneCount: number
    setSceneCount: (count: number) => void
    isReadOnly: boolean
    setSidebarOpen: (open: boolean) => void
    openShotlistOptionsDialog: () => void
}){
    const client = useApolloClient()
    const {openAccountDialog, AccountDialog} = useAccountDialog()

    const updateShotlistName = async (name: string) => {
        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation updateShotlist($shotlistId: String!, $name: String!) {
                    updateShotlist(editDTO: {
                        id: $shotlistId
                        name: $name
                    }){
                        id
                        name
                    }
                }
            `,
            variables: { shotlistId: query.data.shotlist?.id, name: name },
        });

        if (errors) {
            console.error(errors);
            return;
        }

        const newShotlist: ShotlistDto = {
            ...query.data.shotlist,
            name: data.updateShotlist.name
        }

        setQuery({
            ...query,
            data: {
                ...query.data,
                shotlist: newShotlist
            }
        })
    }

    const debounceUpdateShotlistName = wuGeneral.debounce(updateShotlistName)

    const moveScene = (sceneId: string, from: number, to: number) => {
        client.mutate({
            mutation: gql`
                mutation updateScene($id: String!, $position: Int!) {
                    updateScene(editDTO:{
                        id: $id,
                        position: $position
                    }){
                        id
                        position
                    }
                }
            `,
            variables: {id: sceneId, position: to},
        })

        if(!query.data.shotlist || !query.data.shotlist.scenes) return

        const newScenes = Utils.reorderArray(query.data.shotlist.scenes || [], from, to)

        setQuery({
            ...query,
            data: {
                ...query.data,
                scenes: newScenes
            }
        })
    }

    const removeScene = (sceneId: string) => {
        if(!query.data.shotlist || !query.data.shotlist.scenes) return

        let currentScenes = query.data.shotlist.scenes as SceneDto[]
        const newScenes: SceneDto[] = currentScenes.filter((scene: SceneDto) => scene.id != sceneId)

        setQuery({
            ...query,
            data: {
                ...query.data,
                scenes: newScenes
            }
        })

        setSceneCount(newScenes.length)

        setSelectedSceneId("")
    }

    const createScene = async () => {
        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation createScene($shotlistId: String!) {
                    createScene(shotlistId: $shotlistId){
                        id
                        position
                        attributes{
                            id
                            definition{id, name, position}

                            ... on SceneSingleSelectAttributeDTO{
                                singleSelectValue{id,name}
                            }

                            ... on SceneMultiSelectAttributeDTO{
                                multiSelectValue{id,name}
                            }
                            ... on SceneTextAttributeDTO{
                                textValue
                            }
                        }
                    }
                }
            `,
            variables: { shotlistId: query.data.shotlist?.id },
        });

        if (errors) {
            console.error(errors);
            return;
        }

        const newScenes = [...query.data.shotlist?.scenes as SceneDto[] || [], data.createScene]

        setQuery({
            ...query,
            data: {
                ...query.data,
                shotlist: {...query.data.shotlist, scenes: newScenes}
            }
        })

        setSceneCount(newScenes.length)

        selectScene(data.createScene.id)
    }

    if(!query.data.shotlist?.scenes) return (
        <ErrorDisplay
            title={"Error loading scenes"}
        />
    )

    return (
        <>
            <div className="content">
                <div className="top">
                    <Tooltip.Root>
                        <Tooltip.Trigger className={"noPadding"} asChild>
                            <Link href={`../dashboard`}>
                                <House strokeWidth={2.5} size={20}/>
                            </Link>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className={"TooltipContent"}>
                                <Tooltip.Arrow/>
                                <p><span className="bold">Click</span> to go back to the Dashboard</p>
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <p>/</p>
                    <input
                        type="text"
                        defaultValue={query.data.shotlist?.name || ""}
                        placeholder={"shotlist name"}
                        onInput={e => debounceUpdateShotlistName(e.currentTarget.value)}
                        role={"heading"}
                    />
                </div>
                {/*TODO this absolutely should be its own component wth*/}
                <div className="list" id="sceneList">
                    {!query.data.shotlist.scenes || query.data.shotlist.scenes.length == 0 ?
                        <p className={"empty"}>No scenes yet :(</p> :
                        (query.data.shotlist?.scenes as SceneDto[]).map((scene: SceneDto, index) => (
                            <SidebarScene
                                key={scene.id}
                                scene={scene}
                                position={index}
                                expanded={selectedSceneId == scene.id}
                                onSelect={selectScene}
                                onDelete={removeScene}
                                moveScene={moveScene}
                                readOnly={isReadOnly}
                            />
                        ))
                    }
                    <button className={"create"} disabled={isReadOnly} onClick={createScene}>Add
                        scene <Plus/></button>
                    <div className="bottom">
                        <button
                            onClick={openShotlistOptionsDialog}
                            id={"shotlistOptions"}
                        >
                            Shotlist Options <FileSliders size={18}/>
                        </button>
                        <button onClick={openAccountDialog}>Account <User size={18}/></button>
                    </div>
                </div>
            </div>
            <div className="bottom">
                <Link className="shotlistTool" href={"/"}><Iconmark/>shotly.at</Link>
            </div>
            <button className="closearea" onClick={() => setSidebarOpen(false)}/>
            {AccountDialog}
        </>
    )
}