import {SceneAttributeType, ShotAttributeType, ShotlistDto} from "../../../../../../lib/graphql/generated"
import {Popover, Separator, Tabs} from "radix-ui"
import React, {RefObject, useRef} from "react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {useRouter} from "next/navigation"
import "./attributeTab.scss"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable"
import ShotAttributeDefinition from "@/components/app/dialogs/shotlistOptionsDialog/attributeTab/shotAttributeDefinition"
import {ChevronDown, GripVertical, List, Plus, Type, X} from "lucide-react"
import SceneAttributeDefinition from "@/components/app/dialogs/shotlistOptionsDialog/attributeTab/sceneAttributeDefinition"
import {ShotlistOptionsDialogSubPage} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {AnySceneAttributeDefinition, AnyShotAttributeDefinition} from "@/utility/Types"
import HelpLink from "@/components/app/helpLink/helpLink"
import Skeleton from "react-loading-skeleton"
import {errorNotification} from "@/service/NotificationService"
import {DialogRef} from "@/components/basic/dialog/dialog"
import SimplePopover, {SimplePopoverRef} from "@/components/basic/popover/simplePopover"

export default function AttributeTab(
    {
        shotlistId,
        shotAttributeDefinitions,
        setShotAttributeDefinitions,
        sceneAttributeDefinitions,
        setSceneAttributeDefinitions,
        selectedPage = ShotlistOptionsDialogSubPage.scene,
        setSelectedPage,
        dataChanged,
        shotlistOptionsDialogRef,
        isAvailable
    }
        :
    {
        shotlistId: string | null,
        shotAttributeDefinitions: AnyShotAttributeDefinition[] | null,
        setShotAttributeDefinitions: React.Dispatch<React.SetStateAction<AnyShotAttributeDefinition[] | null>>,
        sceneAttributeDefinitions: AnySceneAttributeDefinition[] | null,
        setSceneAttributeDefinitions: React.Dispatch<React.SetStateAction<AnySceneAttributeDefinition[] | null>>
        selectedPage: ShotlistOptionsDialogSubPage
        setSelectedPage: (page: ShotlistOptionsDialogSubPage) => void
        dataChanged: () => void
        shotlistOptionsDialogRef: RefObject<DialogRef | null>
        isAvailable: boolean

    }
) {
    const client = useApolloClient()
    const router = useRouter()

    const addSceneAttributePopoverRef = useRef<SimplePopoverRef>(null)
    const addShotAttributePopoverRef = useRef<SimplePopoverRef>(null)

    const sceneCreationLoaderRef = useRef<HTMLDivElement>(null)
    const shotCreationLoaderRef = useRef<HTMLDivElement>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor)
    );

    const setCreationLoaderVisibility = (type: "scene" | "shot", visible: boolean) => {
        const loader = type == "scene" ? sceneCreationLoaderRef : shotCreationLoaderRef

        if(!loader.current) return

        loader.current.style.display = visible ? "flex" : "none"
    }

    const updateUrl = (page?: ShotlistOptionsDialogSubPage) => {
        const url = new URL(window.location.href)

        url.searchParams.set("oo", "true") // options open
        if(page)
            url.searchParams.set("sp", page) // sub page

        router.push(url.toString())
    }

    function removeShotAttributeDefinition(definitionId: number) {
        if(!shotAttributeDefinitions || shotAttributeDefinitions.length == 0) return

        setShotAttributeDefinitions(current => {
            if(!current) return current
            return current.filter((shotDefinition: AnyShotAttributeDefinition) => shotDefinition.id != definitionId)
        })
    }

    async function createShotAttributeDefinition(type: ShotAttributeType) {
        setCreationLoaderVisibility("shot", true)

        addShotAttributePopoverRef.current?.close()

        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation createShotAttributeDefinition($shotlistId: String!, $attributeType: ShotAttributeType!) {
                    createShotAttributeDefinition(createDTO: {
                        shotlistId: $shotlistId,
                        type: $attributeType
                    }) {
                        id
                        name
                        position
                        type
                    }
                }
            `,
            variables: {shotlistId: shotlistId, attributeType: type},
        });
        if (errors) {
            errorNotification({
                title: "Failed to create attribute definition",
                tryAgainLater: true
            })
            console.error(errors);
            setCreationLoaderVisibility("shot", false)
            return;
        }

        setShotAttributeDefinitions(current => [
            ...(current || []),
            data.createShotAttributeDefinition
        ])

        setCreationLoaderVisibility("shot", false)
    }

    function handleShotAttributeDefinitionDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && shotAttributeDefinitions) {
            const oldIndex = shotAttributeDefinitions.findIndex((definition) => definition.id === active.id);
            const newIndex = shotAttributeDefinitions.findIndex((definition) => definition.id === over.id);

            client.mutate({
                mutation: gql`
                    mutation updateShotDefinition($id: BigInteger!, $position: Int!) {
                        updateShotAttributeDefinition(editDTO:{
                            id: $id,
                            position: $position
                        }){
                            id
                            position
                        }
                    }
                `,
                variables: {id: active.id, position: newIndex},
            }).then((result) => {
                if(result.errors) {
                    errorNotification({
                        title: "Failed to move shot attribute definition",
                        tryAgainLater: true
                    })

                    console.error(result.errors)
                }
            })


            setShotAttributeDefinitions(current => current ? arrayMove(current, oldIndex, newIndex) : current)
        }
    }

    function removeSceneAttributeDefinition(definitionId: number) {
        if(!sceneAttributeDefinitions || sceneAttributeDefinitions.length == 0) return

        setSceneAttributeDefinitions(current => {
            if(!current) return current
            return current.filter(
                (sceneDefinition: AnySceneAttributeDefinition) => sceneDefinition.id != definitionId
            )
        })
    }

    async function createSceneAttributeDefinition(type: SceneAttributeType) {
        setCreationLoaderVisibility("scene", true)

        addSceneAttributePopoverRef.current?.close()

        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation createSceneAttributeDefinition($shotlistId: String!, $attributeType: SceneAttributeType!) {
                    createSceneAttributeDefinition(createDTO: {
                        shotlistId: $shotlistId,
                        type: $attributeType
                    }) {
                        id
                        name
                        position
                        type
                    }
                }
            `,
            variables: {shotlistId: shotlistId, attributeType: type},
        });
        if (errors) {
            errorNotification({
                title: "Failed to create attribute definition",
                tryAgainLater: true
            })
            console.error(errors);
            setCreationLoaderVisibility("scene", false)
            return;
        }

        setSceneAttributeDefinitions(current => [
            ...(current || []),
            data.createSceneAttributeDefinition
        ])

        setCreationLoaderVisibility("scene", false)
    }

    function handleSceneAttributeDefinitionDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && sceneAttributeDefinitions) {
            const oldIndex = sceneAttributeDefinitions.findIndex((definition) => definition.id === active.id);
            const newIndex = sceneAttributeDefinitions.findIndex((definition) => definition.id === over.id);

            client.mutate({
                mutation: gql`
                    mutation updateSceneDefinition($id: BigInteger!, $position: Int!) {
                        updateSceneAttributeDefinition(editDTO:{
                            id: $id,
                            position: $position
                        }){
                            id
                            position
                        }
                    }
                `,
                variables: {id: active.id, position: newIndex},
            }).then(result => {
                if(result.errors) {
                    errorNotification({
                        title: "Failed to move scene attribute definition",
                        tryAgainLater: true
                    })
                    console.error(result.errors)
                }
            })


            setSceneAttributeDefinitions(current => current ? arrayMove(current, oldIndex, newIndex) : current)
        }
    }

    if(!isAvailable) {
        return <div className={"attributeTypeTabRoot shotlistOptionsDialogAttributeTab shotlistOptionsDialogPage"}>
            <div className="top">
                <h2>Attributes</h2>
                <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>
            <p className={"empty"}>Attributes are not available since this shotlist is read-only.</p>
        </div>
    }

    return (
        <>
            <Tabs.Root
                className={"attributeTypeTabRoot shotlistOptionsDialogAttributeTab shotlistOptionsDialogPage"}
                value={selectedPage}
                onValueChange={page => {
                    updateUrl(page as ShotlistOptionsDialogSubPage)
                    setSelectedPage(page as ShotlistOptionsDialogSubPage)
                }}
            >
                <div className="top">
                    <Tabs.List className={"tabs"}>
                        <Tabs.Trigger value={"scene"}>
                            Scene
                        </Tabs.Trigger>
                        <Tabs.Trigger value={"shot"}>
                            Shot
                        </Tabs.Trigger>
                    </Tabs.List>
                    <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                        <X size={18}/>
                    </button>
                </div>
                <Tabs.Content
                    value={"scene"}
                    className={"content"}
                    forceMount={true}
                    style={{display: selectedPage == "scene" ? "block" : "none"}}
                >
                    {!sceneAttributeDefinitions ?
                        <>
                            <Skeleton height={"2.5rem"} count={3} style={{marginTop: ".5rem"}}/>
                            <Skeleton height={"2rem"} width={"15ch"} style={{marginTop: "2rem"}}/>
                        </>
                        :
                        <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleSceneAttributeDefinitionDragEnd}
                            >
                                <SortableContext
                                    items={sceneAttributeDefinitions?.map(def => def.id) || []}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="definitions">
                                        {sceneAttributeDefinitions?.map((attribute) => (
                                            <SceneAttributeDefinition
                                                attributeDefinition={attribute}
                                                key={attribute.id}
                                                onDelete={removeSceneAttributeDefinition}
                                                dataChanged={dataChanged}
                                            />
                                        ))}
                                        {sceneAttributeDefinitions?.length == 0 &&
                                            <div className={"noResults"}>
                                                No attributes defined yet :(
                                            </div>
                                        }
                                        <div ref={sceneCreationLoaderRef} className={"creationLoader"}>
                                            <GripVertical/>
                                            <Skeleton height={"1.5rem"} width={"1.5rem"}/>
                                            <Skeleton height={"2.5rem"} width={"30ch"}/>
                                            <Skeleton height={"2.5rem"} width={"2.5rem"}/>
                                        </div>
                                    </div>
                                </SortableContext>
                            </DndContext>

                            <SimplePopover
                                ref={addSceneAttributePopoverRef}
                                className={"add"}
                                contentClassName={"addAttributeDefinitionPopup"}
                                content={<>
                                    <button onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneTextAttribute)}><Type size={16}/>Text</button>
                                    <button onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneSingleSelectAttribute)}><ChevronDown size={16}/>Single select</button>
                                    <button onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneMultiSelectAttribute)}><List size={16}/>Multi select</button>
                                </>}
                                showArrow={false}
                                side={"bottom"}
                            >
                                Add attribute <Plus size={20}/>
                            </SimplePopover>
                        </>
                    }
                    <span className="scrollSpacer" aria-hidden/>
                </Tabs.Content>
                <Tabs.Content
                    value={"shot"}
                    className={"content"}
                    forceMount={true}
                    style={{display: selectedPage == "shot" ? "block" : "none"}}
                >
                    {!shotAttributeDefinitions ?
                        <>
                            <Skeleton height={"2.5rem"} count={3} style={{marginTop: ".5rem"}}/>
                            <Skeleton height={"2rem"} width={"15ch"} style={{marginTop: "2rem"}}/>
                        </>
                        :
                        <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleShotAttributeDefinitionDragEnd}
                            >
                                <SortableContext
                                    items={shotAttributeDefinitions?.map(def => def.id) || []}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="definitions">
                                        {shotAttributeDefinitions?.map((attribute) => (
                                            <ShotAttributeDefinition
                                                attributeDefinition={attribute}
                                                key={attribute.id}
                                                onDelete={removeShotAttributeDefinition}
                                                dataChanged={dataChanged}
                                            />
                                        ))}
                                        {shotAttributeDefinitions?.length == 0 &&
                                            <div className={"noResults"}>
                                                No attributes defined yet :(
                                            </div>
                                        }
                                        <div ref={shotCreationLoaderRef} className={"creationLoader"}>
                                            <GripVertical/>
                                            <Skeleton height={"1.5rem"} width={"1.5rem"}/>
                                            <Skeleton height={"2.5rem"} width={"30ch"}/>
                                            <Skeleton height={"2.5rem"} width={"2.5rem"}/>
                                        </div>
                                    </div>
                                </SortableContext>
                            </DndContext>

                            <SimplePopover
                                ref={addShotAttributePopoverRef}
                                className={"add"}
                                contentClassName={"addAttributeDefinitionPopup"}
                                content={<>
                                    <button onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotTextAttribute)}><Type size={16}/>Text</button>
                                    <button onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotSingleSelectAttribute)}><ChevronDown size={16}/>Single select</button>
                                    <button onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotMultiSelectAttribute)}><List size={16}/>Multi select</button>
                                </>}
                                showArrow={false}
                                side={"bottom"}
                            >
                                Add attribute <Plus size={20}/>
                            </SimplePopover>
                        </>
                    }
                    <span className="scrollSpacer" aria-hidden/>
                </Tabs.Content>
            </Tabs.Root>
            <HelpLink link="https://docs.shotly.at/shotlist/attributes" name={"Attribute"} floating/>
        </>
    )
}