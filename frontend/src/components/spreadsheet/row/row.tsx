import React, {forwardRef, memo, ReactNode, useContext, useImperativeHandle, useMemo, useState} from "react"
import "./row.scss"
import {Popover, Separator, Tooltip} from "radix-ui"
import {ArrowBigDown, ArrowBigUp, CornerDownRight, GripVertical, List, NotepadText, Trash} from "lucide-react"
import {ShotDto} from "../../../../lib/graphql/generated"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {ShotlistContext} from "@/context/ShotlistContext"

export interface RowRef {
    closePopover: () => void
}

export interface RowProps {
    shot: ShotDto
    position: number
    onDelete: (shotId: string) => void
    moveShot: (shotId: string, oldPos: number, newPos: number) => void
    isReadOnly: boolean
    children: ReactNode
}

/**
 * Represents a single row in the spreadsheet aka a shot
 * @param children
 * @constructor
 */
const RowBase = forwardRef<RowRef, RowProps>(({
    shot,
    position,
    onDelete,
    moveShot,
    isReadOnly,
    children,
}, ref) => {
    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)

    const [isBeingEdited, setIsBeingEdited] = useState(false)

    useImperativeHandle(ref, () => ({
        closePopover
    }))

    const closePopover = () => {
        setIsBeingEdited(false)
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
    <div
        className={`sheetRow ${isBeingEdited && "active"}`}
        data-shot-id={shot.id}
    >
        {
            !isReadOnly &&
            <Popover.Root onOpenChange={setIsBeingEdited} open={isBeingEdited}>
                <Popover.Trigger
                    className="grip"
                >
                    <GripVertical/>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="PopoverContent shotContextOptionsPopup" align={"center"}>
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
                        <Separator.Root className="Separator"/>
                        <p className={"instructions"}><span className="bold">Click</span> to edit, <span className="bold">Drag</span> to reorder</p>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        }
        {children}
    </div>
    )
})

export const Row = memo(RowBase)