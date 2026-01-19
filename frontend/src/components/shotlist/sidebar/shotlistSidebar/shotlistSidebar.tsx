import Iconmark from "@/components/iconmark"
import {FileSliders, House, Plus, User } from "lucide-react"
import Link from "next/link"
import {Popover, Tooltip } from "radix-ui"
import {Query, SceneDto, ShotlistDto} from "../../../../../lib/graphql/generated"
import gql from "graphql-tag"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {wuGeneral} from "@yanikkendler/web-utils"
import ErrorDisplay from "@/components/feedback/errorDisplay/errorDisplay"
import SidebarScene, {SidebarSceneRef} from "@/components/shotlist/sidebar/sidebarScene/sidebarScene"
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useRef} from "react"
import Utils from "@/util/Utils"
import {useAccountDialog} from "@/components/dialogs/accountDialog/accountDialog"
import Sortable from "sortablejs"
import {ShotlistContext} from "@/context/ShotlistContext"
import "./shotlistSidebar.scss"
import {SelectedScene} from "@/app/shotlist/[id]/page"
import {UserMinimalDTO} from "@/service/ShotlistSyncService"
import {SceneAttributeRef} from "@/components/shotlist/sidebar/sceneAttribute/sceneAttribute"
import Skeleton from "react-loading-skeleton"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"

export interface ShotlistSidebarRef {
    getScene: (position: number) => SceneDto | null
    findScene: (sceneId: string) => SidebarSceneRef | null
    findAttribute: (attributeId: number) => SceneAttributeRef | null
    onCreateScene: (scene: SceneDto) => void,
    onDeleteScene: (sceneId: string) => void
    onMoveScene: (sceneId: string, to: number) => void
}

export interface ShotlistSidebarProps {
    query: ApolloQueryResult<Query>
    selectScene: (id: string | null, position: number | null) => void
    setQuery: (query: ApolloQueryResult<Query>) => void
    selectedScene: SelectedScene
    sceneCount: number
    setSceneCount: (count: number) => void
    isReadOnly: boolean
    reloadInProgress: boolean
    setSidebarOpen: (open: boolean) => void
    openShotlistOptionsDialog: () => void
    presentCollaborators: UserMinimalDTO[]
}

const ShotlistSidebar = forwardRef<ShotlistSidebarRef, ShotlistSidebarProps>(({
    query,
    selectScene,
    setQuery,
    selectedScene,
    sceneCount,
    setSceneCount,
    isReadOnly,
    reloadInProgress,
    setSidebarOpen,
    openShotlistOptionsDialog,
    presentCollaborators
}, ref) =>{
    const client = useApolloClient()
    const {openAccountDialog, AccountDialog} = useAccountDialog()
    const shotlistContext = useContext(ShotlistContext)

    const sortableRef = useRef<Sortable|null>(null)

    const sceneRefs = useRef<Map<number, SidebarSceneRef | null>>(new Map())
    const creationLoaderRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
        getScene: (position: number) => sceneRefs.current.get(position) || null,
        findScene: (sceneId: string): SidebarSceneRef | null =>
            Array.from(sceneRefs.current.values())
                .find(scene => scene?.id == sceneId) ?? null,
        findAttribute: attributeId => {
            for (let sceneRef of Array.from(sceneRefs.current.values())) {
                if(!sceneRef) continue

                const attributeRef = sceneRef.findAttribute(attributeId)
                if(attributeRef) return attributeRef
            }

            return null
        },
        onCreateScene: onCreateScene,
        onDeleteScene: onDeleteScene,
        onMoveScene: onMoveScene,
    }))

    useEffect(() => {
        if (sortableRef.current?.el) {
            sortableRef.current.destroy()
        }

        /**
         * creating a new SortableJS instance
         * using a native JS library without react because the reordering is quite simple and the react re-renders
         * were creating substantial complexity and performance issues
         */
        const shots = document.querySelector('#scenes')
        if(shots){
            sortableRef.current = Sortable.create(shots as HTMLElement, {
                handle: '.grip',
                animation: 150,
                forceFallback: true,
                fallbackTolerance: 5,
                onStart: (event) => {
                    console.log("drag started")

                    if(event.oldIndex === undefined) return

                    shotlistContext.elementIsBeingDragged = true

                    sceneRefs.current.get(event.oldIndex)?.closePopover()
                },
                onEnd: (event) => {
                    console.log("drag end")
                    //so that the drag ghost is hidden before re-rendering otherwise it hangs in the air for half a second
                    requestAnimationFrame(() => {
                        if(!event.item || event.oldIndex === undefined || event.newIndex === undefined) return

                        sceneRefs.current.get(event.oldIndex)?.closePopover()

                        moveScene(
                            event.item.dataset.sceneId as string,
                            event.newIndex
                        )

                        shotlistContext.elementIsBeingDragged = false
                    })
                }
            })
        }
    }, [query]);

    const setCreationLoaderVisibility = (visible: boolean) => {
        if(!creationLoaderRef.current) return

        creationLoaderRef.current.style.display = visible ? "flex" : "none"
    }

    const updateShotlistName = async (name: string) => {
        shotlistContext.setSaveState("updateShotlistName", "saving")

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
            shotlistContext.handleError({
                locationKey: "updateShotlistName",
                message: "Failed to update shotlist name",
                cause: errors
            })
            shotlistContext.setSaveState("updateShotlistName", "error")
            return
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

        shotlistContext.setSaveState("updateShotlistName", "saved")
    }

    const debounceUpdateShotlistName = wuGeneral.debounce(updateShotlistName)

    const moveScene = (sceneId: string, to: number) => {
        if(!query.data.shotlist || !query.data.shotlist.scenes) return

        shotlistContext.setSaveState("moveScene", "saving")

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
        }).then(({errors}) => {
            if(errors){
                shotlistContext.handleError({
                    locationKey: "moveScene",
                    message: "Failed to move scene",
                    cause: errors
                })
                shotlistContext.setSaveState("moveScene", "error")
                return
            }
            shotlistContext.setSaveState("moveScene", "saved")
        })


        onMoveScene(sceneId, to)

        // updates the position of the currently selected scene so that the scene number
        // next to the shots is displayed correctly - this is accomplished via a re-render which is why
        // its avoided if scene nums are turned off
        if(Utils.getUserSettingsFromLocalStorage().displaySceneNumbersNextToShotNumbers)
            selectScene(sceneId, to)
    }

    const onMoveScene = (sceneId: string, to: number) => {
        const from = query.data.shotlist?.scenes?.findIndex((scene) => scene?.id == sceneId)

        if(from == undefined || !query.data.shotlist?.scenes) return

        const newScenes = Utils.reorderArray(query.data.shotlist.scenes || [], from, to)

        setQuery({
            ...query,
            data: {
                ...query.data,
                shotlist: {
                    ...query.data.shotlist,
                    scenes: newScenes
                }
            }
        })
    }

    const onDeleteScene = (sceneId: string) => {
        if(!query.data.shotlist || !query.data.shotlist.scenes) return

        let currentScenes = query.data.shotlist.scenes as SceneDto[]
        const newScenes: SceneDto[] = currentScenes.filter((scene: SceneDto) => scene.id != sceneId)

        setQuery({
            ...query,
            data: {
                ...query.data,
                shotlist: {...query.data.shotlist, scenes: newScenes}
            }
        })

        setSceneCount(newScenes.length)
    }

    const createScene = async () => {
        setCreationLoaderVisibility(true)
        shotlistContext.setSaveState("createScene", "saving")

        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation createScene($shotlistId: String!) {
                    createScene(shotlistId: $shotlistId){
                        id
                        position
                        attributes{
                            id
                            definition{id, name, position}
                            type

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
            variables: {shotlistId: query.data.shotlist?.id},
        });

        if (errors) {
            shotlistContext.handleError({
                locationKey: "createScene",
                message: "Failed to create scene",
                cause: errors
            })
            shotlistContext.setSaveState("createScene", "error")
            return;
        }

        onCreateScene(data.createScene)

        selectScene(data.createScene.id || null, query.data.shotlist?.scenes?.length ?? null)

        setCreationLoaderVisibility(false)

        shotlistContext.setSaveState("createScene", "saved")
    }

    const onCreateScene = (scene: SceneDto) => {
        const newScenes = [...query.data.shotlist?.scenes as SceneDto[] || [], scene]

        setQuery({
            ...query,
            data: {
                ...query.data,
                shotlist: {...query.data.shotlist, scenes: newScenes}
            }
        })

        setSceneCount(newScenes.length)
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
                    <SimpleTooltip
                        content={<p><span className="bold">Click</span> to go back to the Dashboard</p>}
                    >
                        <Link href={`../dashboard`}>
                            <House strokeWidth={2.5} size={20}/>
                        </Link>
                    </SimpleTooltip>
                    <p>/</p>
                    <input
                        type="text"
                        defaultValue={query.data.shotlist?.name || ""}
                        placeholder={"shotlist name"}
                        onInput={e => debounceUpdateShotlistName(e.currentTarget.value)}
                        role={"heading"}
                    />
                </div>
                <div className={`list ${reloadInProgress && "reloading"}`} id={`sceneList`}>
                    <div id="scenes">
                        {!query.data.shotlist.scenes || query.data.shotlist.scenes.length == 0 ?
                            <p className={"empty"}>No scenes yet :(</p> :
                            (query.data.shotlist.scenes as SceneDto[]).map((scene: SceneDto, index) => (
                                <SidebarScene
                                    key={scene.id}
                                    scene={scene}
                                    position={index}
                                    expanded={selectedScene.id == scene.id}
                                    onSelect={selectScene}
                                    onDelete={onDeleteScene}
                                    moveScene={moveScene}
                                    readOnly={isReadOnly}
                                    ref={(node) => {
                                        sceneRefs.current.set(index, node)

                                        return () => {
                                            sceneRefs.current.delete(index)
                                        }
                                    }}
                                />
                            ))
                        }
                        <div ref={creationLoaderRef} style={{display: "none", gap: ".5rem"}} className={"sidebarScene"}>
                            <p className="number">{sceneCount+1} New Scene</p>
                            <Skeleton height={"1.5rem"}/>
                            <Skeleton height={"1.5rem"}/>
                        </div>
                    </div>
                    {
                        !isReadOnly &&
                        <button
                        className={"create"}
                            disabled={isReadOnly}
                            onClick={createScene}
                        >
                            Add scene <Plus/>
                        </button>
                    }
                    <div className="bottom">
                        {
                            presentCollaborators && presentCollaborators.length > 0 && (
                                <Popover.Root>
                                    <Popover.Trigger
                                        className="collaborators"
                                    >
                                        {
                                            presentCollaborators.map(user => (
                                                <div key={user.id} className={"collaborator"}>
                                                <span>
                                                    {user.name.at(0)?.toUpperCase() || "?"}
                                                </span>
                                                </div>
                                            ))
                                        }
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content className={"PopoverContent"} side={"top"}>
                                            {/*<Popover.Arrow/>*/}
                                            {
                                                Array.from(presentCollaborators).map(user => (
                                                    <p key={user.id}>{user.name}</p>
                                                ))
                                            }
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                            )
                        }
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
                <Link className="shotlistTool" href={"/public"}><Iconmark/>shotly.at</Link>
            </div>
            <button className="closearea" onClick={() => setSidebarOpen(false)}/>
            {AccountDialog}
        </>
    )
})

export default ShotlistSidebar