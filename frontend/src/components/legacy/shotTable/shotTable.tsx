'use client'

import {useApolloClient, useQuery} from "@apollo/client"
import gql from "graphql-tag"
import Shot, {ShotRef} from "@/components/legacy/shot/shot"
import "./shotTable.scss"
import {SceneDto, ShotAttributeDefinitionBase, ShotDto} from "../../../../lib/graphql/generated"
import React, {forwardRef, RefObject, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react"
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
import { tinykeys } from "@/../node_modules/tinykeys/dist/tinykeys"//package has incorrectly configured type exports
import {wuText} from "@yanikkendler/web-utils"

export type ShotTableRef = {
    refresh: () => void;
};

const ShotTable = forwardRef((
    {sceneId, shotAttributeDefinitions, readOnly, shotlistHeaderRef}:
    {sceneId: string, shotAttributeDefinitions: ShotAttributeDefinitionBase[], readOnly: boolean, shotlistHeaderRef: RefObject<HTMLDivElement | null> }, ref
) => {
    const [shots, setShots] = useState<{data: ShotDto[], loading: boolean, error: any}>({data: [], loading: true, error: null})
    const [focusAttributeAt, setFocusAttributeAt] = useState<number>(-1) //which attribute to set focus to next (-1 = dont move focus)
    const shotTableElement = useRef<HTMLDivElement | null>(null)
    const isSyncingScroll = useRef(false) //to not detect updating the scroll as a scroll
    const shotRefs = useRef(new Map<string, ShotRef | null>())

    const client = useApolloClient()

    const shotlistContext = useContext(ShotlistContext)

    const focusedAttrRef = useRef(shotlistContext.focusedCell)
    const shotAttributeCountRef = useRef(0)

    // Used to conditionally render the dropLine
    const [overId, setOverId] = useState<number | string | null>(null)
    const [dropLinePosition, setDropLinePosition] = useState<"" | "top" | "bottom">("")

    useEffect(() => {
        focusedAttrRef.current = shotlistContext.focusedCell
    }, [shotlistContext.focusedCell])

    //everytime the shots change
    useEffect(() => {
        if(shots.data && shots.data[0] && shots.data[0].attributes){
            shotAttributeCountRef.current = shots.data[0].attributes.length-1
        }

        if(focusAttributeAt < 0) return

        /*
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

        if(shotRefs.current){
            [...shotRefs.current.values()].at(-1)?.setFocusToAttributeAt(focusAttributeAt)
        }

        setFocusAttributeAt(-1)
    }, [shots])

    //TODO this is a bit laggy when fast pressing.. might be just the css tho
    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "ArrowLeft": () => moveFocusedCell(0, -1),
            "ArrowRight": () => moveFocusedCell(0, 1),
            "ArrowUp": () => moveFocusedCell(-1, 0),
            "ArrowDown": () => moveFocusedCell(1, 0),
        })
        return () => {
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        if(sceneId != "")
            loadShots()
    }, [sceneId])

    const moveFocusedCell = (row:number = 0, column: number = 0) => {
        /*if(!focusedAttrRef.current || shotAttributeCountRef.current == 0) return

        console.log("moving: ", row, column)

        const newRow = wuText.clamp(
            0,
            focusedAttrRef.current.row+row,
            shotRefs.current.size-1
        )

        const newColumn = wuText.clamp(
            0,
            focusedAttrRef.current.column+column,
            shotAttributeCountRef.current
        );

        [...shotRefs.current.values()]
            .at(newRow)?.
            setFocusToAttributeAt(newColumn)*/
    }

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

    const loadShots = async () => {
        console.log("started loading shots")
        console.time("loadShots-"+sceneId)
        const { data, errors, loading } = await client.query({
            query : gql`
                query getShots($sceneId: String!){
                    shots(sceneId: $sceneId){
                        id
                        position
                        attributes{
                            id
                            definition{id, name, position}
                            type

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
        console.log("started creating")
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
                            type

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
        })
        console.timeEnd("createShot")

        if (errors) {
            console.error(errors);
            return;
        }

        setFocusAttributeAt(attributePosition)

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
                        onDragOver={event => {
                            const { active, over } = event;

                            if (over) {
                                setOverId(over.id)

                                console.log(over.id, active.id)

                                //component being dragged
                                const activeIndex = [...shotRefs.current.keys()].indexOf(String(active.id))
                                //component being hovered over
                                const overIndex = [...shotRefs.current.keys()].indexOf(String(over.id))

                                if (activeIndex > overIndex) setDropLinePosition("top");
                                else setDropLinePosition("bottom");
                            }
                        }}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext
                            items={shots.data.map(shot => shot.id as string)}
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
/*
                                    ref={shots.data.length -1 == index ? lastShotRef : null}
*/
                                    ref={(node) => {
                                        shotRefs.current.set(shot.id, node);

                                        return () => {
                                            shotRefs.current.delete(shot.id);
                                        };
                                    }}
                                />
                            ))}
                        </SortableContext>
                        <DragOverlay>
                            {shotlistContext.elementIsBeingDragged ? <p>blabla</p> : null}
                        </DragOverlay>
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
