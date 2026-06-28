import { Plus } from "lucide-react"
import {Query, SceneDto } from "../../../../../../lib/graphql/generated"
import gql from "graphql-tag"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import ErrorDisplay from "@/components/app/feedback/errorDisplay/errorDisplay"
import Scene, {SidebarSceneRef} from "@/components/app/shotlist/sidebar/scene/scene"
import React, {Dispatch, forwardRef, SetStateAction, useContext, useEffect, useImperativeHandle, useRef} from "react"
import Utils from "@/utility/Utils"
import Sortable from "sortablejs"
import {ShotlistContext} from "@/context/ShotlistContext"
import "./sceneList.scss"
import {SelectedScene} from "@/app/(application)/shotlist/[id]/page"
import {SceneAttributeRef} from "@/components/app/shotlist/sidebar/sceneAttribute/sceneAttribute"
import Skeleton from "react-loading-skeleton"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import {AppContext} from "@/context/AppContext"
import useWhenReady from "@/service/useWhenReady"

export interface SceneListRef {
    getScene: (position: number) => SidebarSceneRef | null
    findScene: (sceneId: string) => SidebarSceneRef | null
    findAttribute: (attributeId: number) => SceneAttributeRef | null
    onCreateScene: (scene: SceneDto) => void
    onDeleteScene: (sceneId: string) => void
    onMoveScene: (sceneId: string, to: number) => void
    createScene: () => void
    whenReady: (then: () => void) => void
}

export interface ShotlistSidebarProps {
    query: ApolloQueryResult<Query>
    setSelectedScene: Dispatch<SetStateAction<SelectedScene>>
    setQuery: React.Dispatch<React.SetStateAction<ApolloQueryResult<Query>>>
    selectedScene: SelectedScene
    sceneCount: number
    setSceneCount: (count: number) => void
    isReadOnly: boolean
    reloadInProgress: boolean
}

const SceneList = forwardRef<SceneListRef, ShotlistSidebarProps>(({
    query,
    setSelectedScene,
    setQuery,
    selectedScene,
    sceneCount,
    setSceneCount,
    isReadOnly,
    reloadInProgress,
}, ref) =>{
    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)
    const appContext = useContext(AppContext)
    const whenReady = useWhenReady()

    const sortableRef = useRef<Sortable|null>(null)

    const sceneRefs = useRef<Map<number, SidebarSceneRef | null>>(new Map())
    const creationLoaderRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
        getScene: (position: number) => sceneRefs.current.get(position) || null,
        findScene: (sceneId: string): SidebarSceneRef | null => {
            return Array.from(sceneRefs.current.values())
                .find(scene => scene?.id == sceneId) ?? null
        },
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
        createScene: createScene,
        whenReady: whenReady.execute
    }))

    useEffect(() => {
        if(query.loading) return

        whenReady.ready()

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
                    if(event.oldIndex === undefined) return

                    appContext.setElementIsBeingDragged(true)

                    sceneRefs.current.get(event.oldIndex)?.closePopover()
                },
                onEnd: (event) => {
                    appContext.setElementIsBeingDragged(false)

                    //so that the drag ghost is hidden before re-rendering otherwise it hangs in the air for half a second
                    requestAnimationFrame(() => {
                        if(!event.item || event.oldIndex === undefined || event.newIndex === undefined) return

                        sceneRefs.current.get(event.oldIndex)?.closePopover()

                        moveScene(
                            event.item.dataset.sceneId as string,
                            event.newIndex
                        )
                    })
                }
            })
        }
    }, [query])

    const setCreationLoaderVisibility = (visible: boolean) => {
        if(!creationLoaderRef.current) return

        creationLoaderRef.current.style.display = visible ? "flex" : "none"
    }

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
            setSelectedScene({
                id: sceneId,
                position: to,
            })
    }

    const onMoveScene = (sceneId: string, to: number) => {
        setQuery(current => {
            if(!current.data.shotlist?.scenes) return current

            const from = current.data.shotlist.scenes?.findIndex((scene) => scene?.id == sceneId)
            if(from == undefined || from < 0) return current

            const newScenes = Utils.reorderArray(current.data.shotlist.scenes || [], from, to)

            return {
                ...current,
                data: {
                    ...current.data,
                    shotlist: {
                        ...current.data.shotlist,
                        scenes: newScenes
                    }
                }
            }
        })
    }

    const onDeleteScene = (sceneId: string) => {
        setQuery(current => {
            if(!current.data.shotlist?.scenes) return current

            const currentScenes = current.data.shotlist.scenes as SceneDto[]
            const newScenes: SceneDto[] = currentScenes.filter((scene: SceneDto) => scene.id != sceneId)
            setSceneCount(newScenes.length)

            return {
                ...current,
                data: {
                    ...current.data,
                    shotlist: {
                        ...current.data.shotlist,
                        scenes: newScenes
                    }
                }
            }
        })
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

        setSelectedScene({
            id: data.createScene.id || null,
            position: query.data.shotlist?.scenes?.length ?? null
        })

        setCreationLoaderVisibility(false)

        shotlistContext.setSaveState("createScene", "saved")
    }

    const onCreateScene = (scene: SceneDto) => {
        setQuery(current => {
            const newScenes = [...(current.data.shotlist?.scenes as SceneDto[] || []), scene]
            setSceneCount(newScenes.length)

            return {
                ...current,
                data: {
                    ...current.data,
                    shotlist: {
                        ...current.data.shotlist,
                        scenes: newScenes
                    }
                }
            }
        })
    }

    if(query.loading)
        return (
            <div style={{display: "flex", flexDirection: "column", height: "100%"}} className={"content"}>
                <Skeleton height="2rem" count={6} style={{marginBottom: ".3rem"}}/>
            </div>
        )

    if(!query.data.shotlist?.scenes) return (
        <ErrorDisplay
            title={"Error loading scenes"}
        />
    )

    return (
        <div className={`sceneList ${reloadInProgress && "reloading"}`} id={`sceneList`}>
            <div id="scenes">
                {!query.data.shotlist.scenes || query.data.shotlist.scenes.length == 0 ?
                    <p className={"empty"}>No scenes yet :(</p> :
                    (query.data.shotlist.scenes as SceneDto[]).map((scene: SceneDto, index) => (
                        <Scene
                            key={scene.id}
                            scene={scene}
                            position={index}
                            expanded={selectedScene.id == scene.id}
                            setSelectedScene={setSelectedScene}
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
                <SimpleTooltip
                    content={<p><span className="key">Alt</span> + <span className="key">S</span></p>}
                >
                    <button
                    className={"create"}
                        disabled={isReadOnly}
                        onClick={createScene}
                    >
                        New scene <Plus size={20}/>
                    </button>
                </SimpleTooltip>
            }
        </div>
    )
})

export default SceneList