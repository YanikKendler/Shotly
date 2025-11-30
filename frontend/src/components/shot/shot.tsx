'use client'

import {ShotDto} from "../../../lib/graphql/generated"
import ShotAttribute, {ShotAttributeRef} from "@/components/shotAttribute/shotAttribute"
import {AnyShotAttribute} from "@/util/Types"
import {wuText} from "@yanikkendler/web-utils"
import './shot.scss'
import {
    ArrowBigDown,
    ArrowBigUp,
    ArrowDownRight,
    CornerDownRight,
    GripVertical,
    List,
    NotepadText,
    Trash
} from "lucide-react"
import {useSortable} from "@dnd-kit/sortable"
import {CSS} from '@dnd-kit/utilities';
import {Popover, Separator, Tooltip} from "radix-ui"
import React, {
    createRef,
    forwardRef,
    RefObject,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {ShotlistContext} from "@/context/ShotlistContext"
import Utils from "@/util/Utils"

export interface ShotProps {
    shot: ShotDto
    position: number
    onDelete: (shotId: string) => void
    moveShot: (shotId: string, from: number, to: number) => void
    readOnly: boolean
}

export interface ShotRef {
    setFocusToAttributeAt: (index: number) => void;
}

export default forwardRef<ShotRef, ShotProps>(
    function Shot(
        {
            shot,
            position,
            onDelete,
            moveShot,
            readOnly,
        },
        ref
    )
{
    const [isBeingEdited, setIsBeingEdited] = useState(false)
    const [tooltipVisible, setTooltipVisible] = useState(false)

    const shotAttributeRefs = useRef(new Map());

    // @ts-ignore
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({id: shot.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const client = useApolloClient()

    const shotlistContext = useContext(ShotlistContext)

    useImperativeHandle(ref, () => ({
        setFocusToAttributeAt: setFocusToAttributeAt
    }))

    function setFocusToAttributeAt(index: number){
        shotAttributeRefs.current.get(index)?.setFocus()
    }

    async function deleteShot(){
        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteShot($shotId: String!) {
                    deleteShot(id: $shotId) {
                        id
                    }
                }
            `,
            variables: { shotId: shot.id },
        });

        if(errors) {
            console.error(errors)
        }
        else{
            onDelete(shot.id as string)
        }
    }

    return (
        <div className={`shot ${isBeingEdited && "active"}`} ref={setNodeRef} /*style={style}*/>
            <div className="shotAttribute first number">
                {
                    !readOnly &&
                    <Popover.Root onOpenChange={setIsBeingEdited}>
                        <Tooltip.Root
                            open={tooltipVisible}
                            onOpenChange={(newOpen) => {if(!shotlistContext.elementIsBeingDragged) setTooltipVisible(newOpen)}}
                            delayDuration={500}
                        >
                            <Popover.Trigger
                                className="grip"
                                ref={setActivatorNodeRef}
                                {...listeners}
                                {...attributes}
                                onDrag={() => setTooltipVisible(false)}
                            >
                                <Tooltip.Trigger className={"noPadding gripTooltipTrigger"} asChild>
                                    <GripVertical/>
                                </Tooltip.Trigger>
                            </Popover.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content className={"TooltipContent"}>
                                    <Tooltip.Arrow/>
                                    <p><span className="bold">Click</span> to edit</p>
                                    <p><span className="bold">Drag</span> to reorder</p>
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Popover.Portal>
                            <Popover.Content className="PopoverContent shotContextOptionsPopup" align={"start"}>
                                <button disabled={true}><CornerDownRight size={18}/> Make Subshot</button>
                                <button disabled={true}><NotepadText size={18}/> Notes</button>
                                <button className={"bad"} onClick={deleteShot}><Trash size={18}/> Delete</button>
                                <Separator.Root className="Separator"/>
                                <button
                                    disabled={position == 0}
                                    onClick={() => moveShot(shot.id as string, position, position-1)}
                                >
                                    <ArrowBigUp size={18}/>Move up
                                </button>
                                <button
                                    disabled={position >= shotlistContext.shotCount - 1}
                                    onClick={() => moveShot(shot.id as string, position, position+1)}
                                >
                                    <ArrowBigDown size={18}/>Move down
                                </button>
                                <Separator.Root className="Separator"/>
                                <button onClick={() => shotlistContext.openShotlistOptionsDialog({main: "attributes", sub: "shot"})}><List size={18}/> Edit shot attributes</button>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                }
                <p>{Utils.numberToShotLetter(position)}</p>
            </div>
            {(shot.attributes as [AnyShotAttribute])?.map((attr, index) => (
                <ShotAttribute
                    className={index == shot.attributes!.length-1 ? "last" : ""}
                    attribute={attr}
                    key={attr.id}
                    readOnly={readOnly}
                    ref={(node) => {
                        shotAttributeRefs.current.set(index, node);

                        return () => {
                            shotAttributeRefs.current.delete(index);
                        };
                    }}
                    getNeighbourAt={(index:number) => shotAttributeRefs.current.get(index)}
                    onFocus={() => {
                        shotlistContext.setFocusedCell(shotAttributeRefs.current.get(index));
                    }}
                    column={index}
                    row={position}
                ></ShotAttribute>
            ))}
        </div>
    );
})
