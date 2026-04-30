'use client'

import {SceneDto} from "../../../../../../lib/graphql/generated"
import "./sidebarScene.scss"
import React, {
    Dispatch,
    forwardRef,
    SetStateAction,
    useContext,
    useImperativeHandle,
    useRef,
    useState
} from "react"
import { Popover} from "radix-ui"
import {AnySceneAttribute} from "@/utility/Types"
import {ArrowBigDown, ArrowBigUp, GripVertical, List, Trash} from "lucide-react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"
import {ShotlistContext} from "@/context/ShotlistContext"
import SceneAttribute, {SceneAttributeRef} from "../sceneAttribute/sceneAttribute"
import ErrorDisplay from "@/components/app/feedback/errorDisplay/errorDisplay"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import Separator from "@/components/basic/separator/separator"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import {successNotification} from "@/service/NotificationService"
import Utils from "@/utility/Utils"
import Collapse from "@/components/basic/collapse/collapse"
import {SelectedScene} from "@/app/shotlist/[id]/page"

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
    setSelectedScene: Dispatch<SetStateAction<SelectedScene>>
    onDelete: ( id: string) => void,
    moveScene: (sceneId: string, to: number) => void,
    readOnly: boolean
}

const SidebarScene = forwardRef<SidebarSceneRef, SidebarSceneProps>(({
        scene,
        position,
        expanded,
        setSelectedScene,
        onDelete,
        moveScene,
        readOnly
}, ref) => {
    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)
    const { confirm, ConfirmDialog } = useConfirmDialog();
    
    const [sceneAttributes, setSceneAttributes] = useState<AnySceneAttribute[]>(scene.attributes as AnySceneAttribute[]);
    const [editMenuIsOpen, setEditMenuIsOpen] = useState(false);
    const [markAsDeleted, setMarkAsDeleted] = useState(false)

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

    const deleteScene = async () => {
        if(!await confirm({message: `Scene #${position+1} and all of its shots will be lost forever. You cannot undo this.`, buttons: {confirm: {className: "bad"}}})) return

        shotlistContext.setSaveState("deleteScene", "saving")

        setMarkAsDeleted(true)

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
            setMarkAsDeleted(false)
            shotlistContext.handleError({
                locationKey: "deleteScene",
                message: "Failed to the delete the scene.",
                cause: errors
            })
            shotlistContext.setSaveState("deleteScene", "error")
            return
        }

        onDelete(scene.id as string)
        setSelectedScene({id: null, position: null})

        successNotification({
            title: "Scene deleted successfully"
        })

        shotlistContext.setSaveState("deleteScene", "saved")
    }

    if(!scene || !scene.id) return (<ErrorDisplay title={"Scene not found"} scale={0.5} noMargin/>)

    return (
        <SimpleTooltip
            canOpen={!expanded}
            content={<p><span className="key">Alt</span> + <span className="key">{position + 1}</span></p>}
            delay={700}
        >
        <div
            className={`sidebarScene ${expanded ? 'expanded' : ''} ${editMenuIsOpen && "menuOpen"} ${markAsDeleted && "deleting"} ${readOnly && "readOnly"}`}
            onClick={() => {
                if(!shotlistContext.elementIsBeingDragged && !expanded)
                    setSelectedScene({id: scene.id as string, position: position})
            }}
            data-scene-id={scene.id}
        >
            <div className="name">
                <p className="number">{position + 1}</p>
                <SimpleTooltip
                    text={"Since a scene is usually identified by its number, its name is made up of the values of all its attributes. If you want to give it a specific name, simply add a text attribute."}
                    canOpen={expanded}
                >
                    <p className="text">
                        { Utils.sceneAttributesToSceneName(sceneAttributes) }
                    </p>
                </SimpleTooltip>
                <div className="right">
                    <p className={"count"}>{scene.shotCount}</p>
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
                                <Popover.Content className="popoverContent sceneContextOptionsPopup" align={"start"}
                                                 side={"right"} sideOffset={12} alignOffset={-10}>
                                    <button className={"bad"} onClick={(e) => {
                                        e.stopPropagation();
                                        deleteScene()
                                    }}>
                                        <Trash size={18}/>Delete
                                    </button>
                                    <Separator/>
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
                                    <Separator/>
                                    <button onClick={() => shotlistContext.openShotlistOptionsDialog({
                                        main: ShotlistOptionsDialogPage.attributes,
                                        sub: ShotlistOptionsDialogSubPage.scene
                                    })}>
                                        <List size={18}/> Edit scene attributes
                                    </button>
                                    <Separator/>
                                    <p className={"instructions"}>
                                        <span className="bold">Click</span> to edit, <span className="bold">Drag</span> to reorder
                                    </p>
                                </Popover.Content>
                            </Popover.Portal>
                        </Popover.Root>
                    }
                </div>
            </div>

            <Collapse expanded={expanded} recalculateHeightWith={[sceneAttributes]}>
                <div className={`attributes`}>
                    {sceneAttributes.length == 0 ?
                        <p className={"empty"}>
                            {"Add a "}
                            <button
                                className="inline noPadding accent noSceneAttributes"
                                onClick={() => shotlistContext.openShotlistOptionsDialog({
                                    main: ShotlistOptionsDialogPage.attributes,
                                    sub: ShotlistOptionsDialogSubPage.scene
                                })}
                            >
                                scene attribute
                            </button>
                            {" to get started"}
                        </p> :
                        sceneAttributes.map((attr, index) => (
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
            </Collapse>

            {ConfirmDialog}
        </div>
        </SimpleTooltip>
    )
})

export default SidebarScene
