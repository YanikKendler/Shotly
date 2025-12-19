import {SceneAttributeType, ShotAttributeType, ShotlistDto} from "../../../../../lib/graphql/generated"
import {Popover, Separator, Tabs} from "radix-ui"
import React from "react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {useRouter} from "next/navigation"
import "./attributeTab.scss"
import Image from "next/image"
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
import ShotAttributeDefinition from "@/components/dialogs/shotlistOptionsDialog/attributeTab/shotAttributeDefinition/shotAttributeDefinition"
import {ChevronDown, List, Plus, Type} from "lucide-react"
import SceneAttributeDefinition from "@/components/dialogs/shotlistOptionsDialog/attributeTab/sceneAttributeDefinition/sceneAttributeDefinition"
import {ShotlistOptionsDialogSubPage} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {AnySceneAttributeDefinition, AnyShotAttributeDefinition} from "@/util/Types"
import {apolloClient} from "@/components/wrapper/ApolloWrapper"
import Loader from "@/components/feedback/loader/loader"

export default function AttributeTab(
    { shotlistId, shotAttributeDefinitions, setShotAttributeDefinitions, sceneAttributeDefinitions, setSceneAttributeDefinitions, selectedPage = "shot", dataChanged }
        :
    {
        shotlistId: string | null,
        shotAttributeDefinitions: AnyShotAttributeDefinition[] | null,
        setShotAttributeDefinitions: (definitions: AnyShotAttributeDefinition[]) => void,
        sceneAttributeDefinitions: AnySceneAttributeDefinition[] | null,
        setSceneAttributeDefinitions: (definitions: AnySceneAttributeDefinition[]) => void
        selectedPage: ShotlistOptionsDialogSubPage
        dataChanged: () => void
    }
) {
    const client = useApolloClient()
    const router = useRouter()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor)
    );

    const updateUrl = (page?: ShotlistOptionsDialogSubPage) => {
        const url = new URL(window.location.href)

        url.searchParams.set("oo", "true") // options open
        if(page)
            url.searchParams.set("mp", page) // main page

        router.push(url.toString())
    }

    function removeShotAttributeDefinition(definitionId: number) {
        if(!shotAttributeDefinitions || shotAttributeDefinitions.length == 0) return

        let newShotDefinitions: AnyShotAttributeDefinition[] = shotAttributeDefinitions.filter((shotDefinition: AnyShotAttributeDefinition) => shotDefinition.id != definitionId)

        setShotAttributeDefinitions(newShotDefinitions)
    }

    async function createShotAttributeDefinition(type: ShotAttributeType) {
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
            //TODO notify user
            console.error(errors);
            return;
        }

        setShotAttributeDefinitions([
            ...shotAttributeDefinitions || [],
            data.createShotAttributeDefinition
        ])
    }

    function handleShotDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && shotAttributeDefinitions) {
            const oldIndex = shotAttributeDefinitions.findIndex((definition) => definition.id === active.id);
            const newIndex = shotAttributeDefinitions.findIndex((definition) => definition.id === over.id);

            apolloClient.mutate({
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
            })

            setShotAttributeDefinitions(arrayMove(shotAttributeDefinitions, oldIndex, newIndex))
        }
    }

    function removeSceneAttributeDefinition(definitionId: number) {
        if(!sceneAttributeDefinitions || sceneAttributeDefinitions.length == 0) return

        let newSceneDefinitions: AnySceneAttributeDefinition[] = sceneAttributeDefinitions.filter((sceneDefinition: AnySceneAttributeDefinition) => sceneDefinition.id != definitionId)

        setSceneAttributeDefinitions(newSceneDefinitions)
    }

    async function createSceneAttributeDefinition(type: SceneAttributeType) {
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
            console.error(errors);
            return;
        }

        setSceneAttributeDefinitions([
            ...sceneAttributeDefinitions || [],
            data.createSceneAttributeDefinition
        ])
    }

    function handleSceneDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && sceneAttributeDefinitions) {
            const oldIndex = sceneAttributeDefinitions.findIndex((definition) => definition.id === active.id);
            const newIndex = sceneAttributeDefinitions.findIndex((definition) => definition.id === over.id);

            apolloClient.mutate({
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
            })

            setSceneAttributeDefinitions(arrayMove(sceneAttributeDefinitions, oldIndex, newIndex))
        }
    }

    return (
        <div className={"shotlistOptionsDialogAttributeTab"}>
            <Tabs.Root
                className={"attributeTypeTabRoot"}
                defaultValue={selectedPage}
                onValueChange={page => updateUrl(page as ShotlistOptionsDialogSubPage)}
            >
                <Tabs.List className={"tabs"}>
                    <Tabs.Trigger value={"shot"}>
                        Shot
                    </Tabs.Trigger>
                    <Tabs.Trigger value={"scene"}>
                        Scene
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value={"shot"} className={"content"}>
                    {!shotAttributeDefinitions ?
                        <Loader/> :
                        <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleShotDragEnd}
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
                                    </div>
                                </SortableContext>
                            </DndContext>
                            <Popover.Root>
                                <Popover.Trigger className={"add"}>Add attribute <Plus size={20}/></Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content className="PopoverContent addAttributeDefinitionPopup" sideOffset={5} align={"start"}>
                                        <button onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotTextAttribute)}><Type size={16}/>Text</button>
                                        <button onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotSingleSelectAttribute)}><ChevronDown size={16}/>Single select</button>
                                        <button onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotMultiSelectAttribute)}><List size={16}/>Multi select</button>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        </>
                    }
                </Tabs.Content>
                <Tabs.Content value={"scene"} className={"content"}>
                    {!sceneAttributeDefinitions ?
                        <Loader/> :
                        <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleSceneDragEnd}
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
                                    </div>
                                </SortableContext>
                            </DndContext>
                            <Popover.Root>
                                <Popover.Trigger className={"add"}>Add attribute <Plus/></Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content className="PopoverContent addAttributeDefinitionPopup" sideOffset={5} align={"start"}>
                                        <button onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneTextAttribute)}><Type size={16}/>Text</button>
                                        <button onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneSingleSelectAttribute)}><ChevronDown size={16}/>Single select</button>
                                        <button onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneMultiSelectAttribute)}><List size={16}/>Multi select</button>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        </>
                    }
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}