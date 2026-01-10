'use client'

import {SceneAttributeParser} from "@/util/AttributeParser"
import {SceneDto} from "../../../../../lib/graphql/generated"
import "./sidebarScene.scss"
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import {Collapsible, Popover, Separator, Tooltip} from "radix-ui"
import {AnySceneAttribute, AnyShotAttribute} from "@/util/Types"
import {ArrowBigDown, ArrowBigUp, CornerDownRight, GripVertical, List, NotepadText, Trash} from "lucide-react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import {ShotlistContext} from "@/context/ShotlistContext"
import SceneAttribute, {SceneAttributeRef} from "../sceneAttribute/sceneAttribute"
import ErrorDisplay from "@/components/feedback/errorDisplay/errorDisplay"

export interface SidebarSceneRef {
    closePopover: () => void
    getAttribute: (position: number) => SceneAttributeRef | null,
    findAttribute: (attributeId: number) => SceneAttributeRef | null,
    id: string,
    position: number
}

export interface SidebarSceneProps {
    scene: SceneDto,
    position:number,
    expanded: boolean,
    onSelect: ( id: string | null, position: number | null) => void,
    onDelete: ( id: string) => void,
    moveScene: (sceneId: string, to: number) => void,
    readOnly: boolean
}

//TODO first open is laggy
const SidebarScene = forwardRef<SidebarSceneRef, SidebarSceneProps>(({
        scene,
        position,
        expanded,
        onSelect,
        onDelete,
        moveScene,
        readOnly
}, ref) => {
    const [overflowVisible, setOverflowVisible] = useState(false);
    const [sceneAttributes, setSceneAttributes] = useState<AnySceneAttribute[]>(scene.attributes as AnySceneAttribute[]);
    const [editMenuIsOpen, setEditMenuIsOpen] = useState(false);

    const { confirm, ConfirmDialog } = useConfirmDialog();

    const shotlistContext = useContext(ShotlistContext)

    const client = useApolloClient()

    const attributeRefs = useRef<Map<number, SceneAttributeRef | null>>(new Map())

    useImperativeHandle(ref, () => ({
        closePopover: () => setEditMenuIsOpen(false),
        position: position,
        id: scene.id || "unknown",
        getAttribute: (position: number) => attributeRefs.current.get(position) || null,
        findAttribute: (attributeId: number) => {
            for (let attributeRef of Array.from(attributeRefs.current.values())) {
                if(!attributeRef) continue

                if(attributeRef.id == attributeId) return attributeRef
            }
            return null
        }
    }))

    useEffect(() => {
        if (!expanded) {
            setOverflowVisible(false)
        }
        else {
            setTimeout(() => {
                setOverflowVisible(true)
            },300)
        }
    }, [expanded]);

    const deleteScene = async () => {
        if(!await confirm({message: `Scene #${position+1} and all of its shots will be lost forever. You cannot undo this.`, buttons: {confirm: {className: "bad"}}})) return

        shotlistContext.setSaveState("deleteScene", "saving")

        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteScene($sceneId: String!) {
                    deleteScene(id: $sceneId) {
                        id
                    }
                }
            `,
            variables: { sceneId: scene.id },
        })

        if(errors) {
            shotlistContext.handleError({
                locationKey: "deleteScene",
                message: "Failed to the delete the scene.",
                cause: errors
            })
            shotlistContext.setSaveState("deleteScene", "error")
            return
        }

        onDelete(scene.id as string)
        onSelect(null, null)

        shotlistContext.setSaveState("deleteScene", "saved")
    }

    if(!scene || !scene.id) return (<ErrorDisplay title={"Scene not found"} scale={0.5} noMargin/>)

    return (
        <div
            className={`sidebarScene ${expanded ? 'expanded' : ''} ${editMenuIsOpen && "menuOpen"}`}
            onClick={() => {
                if(!shotlistContext.elementIsBeingDragged && !expanded)
                    onSelect(scene.id as string, position)
            }}
            data-scene-id={scene.id}
        >
            <div className="name">
                <p className="number">{position + 1}</p>
                <p className="text">{
                    sceneAttributes.every(attr => SceneAttributeParser.isEmpty(attr))
                        ? "New Scene"
                        : sceneAttributes
                            .filter(attr => !SceneAttributeParser.isEmpty(attr))
                            .map(attr => SceneAttributeParser.toValueString(attr))
                            .join(" • ")
                }</p>
                {
                    !readOnly &&
                    <Popover.Root
                        open={editMenuIsOpen}
                        onOpenChange={(open) => {
                            if (shotlistContext.elementIsBeingDragged) return

                            setEditMenuIsOpen(open)
                        }}
                    >
                        <Popover.Trigger
                            className="grip"
                            onClick={e => {
                                e.stopPropagation()
                            }}
                        >
                            <GripVertical size={expanded ? 22 : 20}/>
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Content className="PopoverContent sceneContextOptionsPopup" align={"start"}
                                             side={"right"} sideOffset={12} alignOffset={-10}>
                                <button className={"bad"} onClick={(e) => {
                                    e.stopPropagation();
                                    deleteScene()
                                }}>
                                    <Trash size={18}/>Delete
                                </button>
                                <Separator.Root className="Separator"/>
                                <button
                                    disabled={position == 0}
                                    onClick={() => moveScene(scene.id as string, position - 1)}
                                >
                                    <ArrowBigUp size={18}/>Move up
                                </button>
                                <button
                                    disabled={position >= shotlistContext.sceneCount - 1}
                                    onClick={() => moveScene(scene.id as string, position + 1)}
                                >
                                    <ArrowBigDown size={18}/>Move down
                                </button>
                                <Separator.Root className="Separator"/>
                                <button onClick={() => shotlistContext.openShotlistOptionsDialog({
                                    main: "attributes",
                                    sub: "scene"
                                })}>
                                    <List size={18}/> Edit scene attributes
                                </button>
                                <Separator.Root className="Separator"/>
                                <p className={"instructions"}><span className="bold">Click</span> to edit, <span className="bold">Drag</span> to reorder</p>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                }
            </div>

            <Collapsible.Root open={expanded}>
                <Collapsible.Content
                    className="CollapsibleContent"
                    style={{overflow: overflowVisible ? "visible" : "hidden",}}
                >
                    <div className="attributes">
                        {sceneAttributes.length == 0 ?
                            <p className={"empty"}>No attributes defined</p> : sceneAttributes.map((attr, index) => (
                                <SceneAttribute
                                    key={attr.id}
                                    attribute={attr}
                                    attributeUpdated={(attribute: AnySceneAttribute) => {
                                        let newAttributes = [...sceneAttributes]
                                        newAttributes[index] = attribute
                                        setSceneAttributes(newAttributes)
                                    }}
                                    isReadOnly={readOnly}
                                    ref={(node) => {
                                        attributeRefs.current.set(index, node)

                                        return () => {
                                            attributeRefs.current.delete(index)
                                        }
                                    }}
                                ></SceneAttribute>
                        ))}
                    </div>
                </Collapsible.Content>
            </Collapsible.Root>

            {ConfirmDialog}
        </div>
    )
})

export default SidebarScene
