'use client'

import {useApolloClient, useQuery} from "@apollo/client"
import gql from "graphql-tag"
import Shot from "@/components/shot/shot"
import "./shotTable.scss"
import {SceneDto, ShotAttributeDefinitionBase} from "../../../lib/graphql/generated"
import React, {forwardRef, RefObject, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import {ScrollArea} from "radix-ui"
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor, rectIntersection, TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable"
import ShotService from "@/service/ShotService"
import {ShotAttributeDefinitionParser} from "@/util/AttributeParser"
import {AnyShotAttributeDefinition} from "@/util/Types"
import {restrictToVerticalAxis} from "@dnd-kit/modifiers"
import {ShotlistContext} from "@/context/ShotlistContext"

export type ShotTableRef = {
    refresh: () => void;
};

const ShotTable = forwardRef((
    {sceneId, shotAttributeDefinitions, readOnly, shotlistHeaderRef}:
    {sceneId: string, shotAttributeDefinitions: ShotAttributeDefinitionBase[], readOnly: boolean, shotlistHeaderRef: RefObject<HTMLDivElement | null> }, ref
) => {
    const shotTableElement = useRef<HTMLDivElement | null>(null)
    const [shots, setShots] = useState<{data: any[], loading: boolean, error: any}>({data: [], loading: true, error: null})
    const [focusAttributeAt, setFocusAttributeAt] = useState<number>(-1)
    const isSyncingScroll = useRef(false);
    const lastShotRef = useRef<React.ComponentRef<typeof Shot>>(null);

    const client = useApolloClient()

    const shotlistContext = useContext(ShotlistContext)

    useEffect(() => {
        if(sceneId != "")
            loadShots()
    }, [sceneId]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                distance: 4,
            }
        })
    )

    //everytime the shots change
    useEffect(() => {
        if(focusAttributeAt < 0) return

        /**
         * we need to focus the newly created cell in the same column as the one that was clicked in the "create new" row
         * because that cell does not exist yet, we set the "focusAttributeAt", then add the shot, causing a re-render
         * then query the now existing row and then set focus at the focusAttributeAt position
         */
        /*if(shotTableElement.current && shotTableElement.current instanceof HTMLElement) {
            let allShots = shotTableElement.current.querySelectorAll(".shot:not(.new)").values().toArray()
            let newShotElement = allShots.at(-1) as HTMLElement
            let attributeElement = newShotElement?.querySelectorAll(".shotAttribute").values().toArray().at(focusAttributeAt) as HTMLElement
            attributeElement.click()
 /!*           attributeElement.querySelector("input")?.focus()
            attributeElement.querySelector("input")?.click()
            attributeElement.querySelector("p")?.focus() //for text inputs*!/
        }*/

        if(lastShotRef.current){
            lastShotRef.current.setFocusToAttributeAt(focusAttributeAt)
        }

        setFocusAttributeAt(-1)
    }, [shots])

    const loadShots = async () => {
        console.time("loadShots-"+sceneId)
        const { data, errors, loading } = await client.query({
            query : gql`
                query shots($sceneId: String!){
                    shots(sceneId: $sceneId){
                        id
                        position
                        attributes{
                            id
                            definition{id, name, position}

                            ... on ShotSingleSelectAttributeDTO{
                                singleSelectValue{id,name}
                            }

                            ... on ShotMultiSelectAttributeDTO{
                                multiSelectValue{id,name}
                            }
                            ... on ShotTextAttributeDTO{
                                textValue
                            }
                        }
                    }
                }
            `,
            variables: { sceneId: sceneId },
            fetchPolicy: "no-cache",
        })
        console.timeEnd("loadShots-"+sceneId)

        shotlistContext.setShotCount(data.shots.length || 0)

        setShots({data: data.shots, loading: loading, error: errors})
    }

    const createShot = async (attributePosition: number) => {
        console.time("createShot")
        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation createShot($sceneId: String!) {
                    createShot(sceneId: $sceneId){
                        id
                        position
                        attributes{
                            id
                            definition{id, name, position}

                            ... on ShotSingleSelectAttributeDTO{
                                singleSelectValue{id,name}
                            }

                            ... on ShotMultiSelectAttributeDTO{
                                multiSelectValue{id,name}
                            }
                            ... on ShotTextAttributeDTO{
                                textValue
                            }
                        }
                    }
                }
            `,
            variables: { sceneId: sceneId },
        });
        console.timeEnd("createShot")

        if (errors) {
            console.error(errors);
            return;
        }

        setFocusAttributeAt(attributePosition+1)

        shotlistContext.setShotCount(shots.data.length + 1)

        setShots({data: [...shots.data, data.createShot], error: shots.error, loading: shots.loading})
    }

    const removeShot = (shotId: string) => {
        if(!shots) return

        let currentShots = shots.data
        let newShots= currentShots.filter((shot) => shot.id != shotId)

        setShots({
            ...shots,
            data: newShots
        })

        shotlistContext.setShotCount(newShots.length)
    }

    function handleDragEnd(event: any) {
        shotlistContext.setElementIsBeingDragged(false)

        const {active, over} = event;

        if (active.id !== over.id) {
            const oldIndex = shots.data.findIndex((shot) => shot.id === active.id)
            const newIndex = shots.data.findIndex((shot) => shot.id === over.id)

            moveShot(active.id, oldIndex, newIndex)
        }
    }

    function moveShot(shotId: string, from: number, to: number) {
        ShotService.updateShot(shotId, to).then(response => {
            if(response.errors) console.error(response.errors)
        })

        setShots((shots) => {
            return {data: arrayMove(shots.data, from, to), error: shots.error, loading: shots.loading}
        })
    }

    const handleScroll = () => {
        const table = shotTableElement.current;
        const header = shotlistHeaderRef.current;

        if (!table || !header) return;

        if (isSyncingScroll.current) {
            isSyncingScroll.current = false;
            return;
        }

        isSyncingScroll.current = true;
        header.scrollLeft = table.scrollLeft;
    };


    if(!sceneId || sceneId == "") return <div className="shotTable"><p className={"error"}>No Scene selected</p></div>
    if(shots.loading) return <div className="shotTable"><p className={"error"}>loading...</p></div>
    if (shots.error) {
        console.error(shots.error)
        return <div className="shotTable"><p className={"error"}>failed to load shots</p></div>
    }

    return (
        <div
            className="shotTable"
            ref={shotTableElement}
            onScroll={handleScroll}
            onScrollEnd={handleScroll}
        >
            {
                shotAttributeDefinitions.length == 0 ?
                <div className={"empty"}>
                    No shots to display. Start by:
                    <button disabled={readOnly} onClick={() => shotlistContext.openShotlistOptionsDialog({main: "attributes", sub: "shot"})}>defining a shot attribute</button>
                </div> :
                <>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        onDragStart={() => {
                            shotlistContext.setElementIsBeingDragged(true)
                        }}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext
                            items={shots.data.map(shot => shot.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {shots.data.map((shot: any, index) => (
                                <Shot
                                    shot={shot}
                                    key={shot.id}
                                    position={index}
                                    onDelete={removeShot}
                                    moveShot={moveShot}
                                    readOnly={readOnly}
                                    ref={shots.data.length -1 == index ? lastShotRef : null}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    {
                        !readOnly &&
                        <div className="shot new">
                            <div className="shotAttribute number first create">
                                <span>#</span>
                            </div>
                            {shotAttributeDefinitions.map((shotAttributeDefinition, index) => {
                                let Icon = ShotAttributeDefinitionParser.toIcon(shotAttributeDefinition as AnyShotAttributeDefinition)
                                return (
                                    <div
                                        className={`shotAttribute create ${index == shotAttributeDefinitions.length - 1 ? "last" : ""}`}
                                        key={shotAttributeDefinition.id}
                                        onClick={() => createShot(index)}
                                    >
                                        <p>{shotAttributeDefinition.name || "Unnamed"}</p>
                                        <div className="icon">
                                            <Icon size={18}/>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    }
                </>
            }
        </div>
    )
})

export default ShotTable
