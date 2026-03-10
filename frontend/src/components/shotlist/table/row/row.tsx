import React, {forwardRef, memo, ReactNode, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import "./row.scss"
import {Popover} from "radix-ui"
import {
    ArrowBigDown,
    ArrowBigUp,
    CornerDownRight,
    GripVertical,
    List,
    MoveDown,
    MoveUp,
    NotepadText,
    Trash
} from "lucide-react"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {ShotlistContext} from "@/context/ShotlistContext"
import {ShotDto} from "../../../../../lib/graphql/generated"
import {Cell} from "../cell/cell"
import Utils from "@/util/Utils"
import Separator from "@/components/separator/separator"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"

export interface RowRef {
    closeContextOptions: () => void,
    openContextOptions: () => void
}

export interface RowProps {
    shot: ShotDto
    position: number
    scenePosition: number
    onDelete: (shotId: string) => void
    moveShot: (shotId: string, newPos: number) => void
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
    scenePosition,
    onDelete,
    moveShot,
    isReadOnly,
    children,
}, ref) => {
    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)

    const [contextOptionsOpen, setContextOptionsOpen] = useState(false)

    const [markAsDeleted, setMarkAsDeleted] = useState(false)

    const keybindUnsubscribe = useRef(() => {})

    useEffect(() => {
        keybindUnsubscribe.current()

        if(contextOptionsOpen){
            keybindUnsubscribe.current = tinykeys(window, {
                "Delete": e => {
                    e.preventDefault()
                    e.stopImmediatePropagation()
                    deleteShot()
                },
                "ArrowUp": (e) => {
                    e.preventDefault()
                    e.stopImmediatePropagation()
                    moveShot(shot.id as string, position-1)
                },
                "ArrowDown": (e) => {
                    e.preventDefault()
                    e.stopImmediatePropagation()
                    moveShot(shot.id as string, position+1)
                },
                "E": e => {
                    e.preventDefault()
                    e.stopImmediatePropagation()

                    shotlistContext.openShotlistOptionsDialog({
                        main: ShotlistOptionsDialogPage.attributes,
                        sub: ShotlistOptionsDialogSubPage.shot
                    })
                }
            })
        }

        return () => {
            keybindUnsubscribe.current()
        }
    }, [contextOptionsOpen, position, shot.id, moveShot])

    useImperativeHandle(ref, () => ({
        closeContextOptions: () => setContextOptionsOpen(false),
        openContextOptions: () => setContextOptionsOpen(true)
    }))

    async function deleteShot(){
        shotlistContext.setSaveState("deleteShot", "saving")

        setMarkAsDeleted(true)
        setContextOptionsOpen(false)

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
            shotlistContext.handleError({
                locationKey: "deleteShot",
                message: "Failed to delete shot.",
                cause: errors
            })
            shotlistContext.setSaveState("deleteShot", "error")
            setMarkAsDeleted(false)
            return
        }

        onDelete(shot.id as string)

        shotlistContext.setSaveState("deleteShot", "saved")
    }

    return (
    <div
        className={`sheetRow ${contextOptionsOpen && "active"} ${markAsDeleted && "deleting"}`}
        data-shot-id={shot.id}
    >
        <Cell
            row={position}
            column={-1}
            type={["number"]}
        >
            {Utils.numberToShotLetter(position, scenePosition)}
            {
                !isReadOnly &&
                <Popover.Root
                    open={contextOptionsOpen}
                    onOpenChange={(open) => {
                        if (shotlistContext.elementIsBeingDragged) return

                        setContextOptionsOpen(open)
                    }}
                >
                    <Popover.Trigger
                        className="grip"
                    >
                        <GripVertical size={22}/>
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content className="popoverContent shotContextOptionsPopup" align={"center"} onCloseAutoFocus={e => e.preventDefault()}>
                            <Popover.Close asChild><button disabled={true}><CornerDownRight size={18}/> Make Subshot</button></Popover.Close>
                            <Popover.Close asChild><button disabled={true}><NotepadText size={18}/> Notes</button></Popover.Close>
                            <Popover.Close asChild>
                                <button className={"bad"} onClick={deleteShot}>
                                    <Trash size={18}/>
                                    Delete
                                    <span className="key subtle">Del</span>
                                </button>
                            </Popover.Close>

                            <Separator/>

                            <Popover.Close asChild>
                                <button
                                    disabled={position == 0}
                                    onClick={() => moveShot(shot.id as string, position-1)}
                                >
                                    <ArrowBigUp size={18}/>
                                    Move up
                                    <span className="key subtle"><MoveUp/></span>
                                </button>
                            </Popover.Close>
                            <Popover.Close asChild>
                                <button
                                    disabled={position >= shotlistContext.shotCount - 1}
                                    onClick={() => moveShot(shot.id as string, position+1)}
                                >
                                    <ArrowBigDown size={18}/>
                                    Move down
                                    <span className="key subtle"><MoveDown/></span>
                                </button>
                            </Popover.Close>

                            <Separator/>

                            <Popover.Close asChild>
                                <button onClick={() => shotlistContext.openShotlistOptionsDialog({
                                    main: ShotlistOptionsDialogPage.attributes,
                                    sub: ShotlistOptionsDialogSubPage.shot})}
                                >
                                    <List size={18}/>
                                    Edit shot attributes
                                    <span className="key subtle">E</span>
                                </button>
                            </Popover.Close>
                            <Separator/>
                            <p className={"instructions"}><span className="bold">Click</span> to edit, <span className="bold">Drag</span> to reorder</p>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            }
        </Cell>
        {children}
    </div>
    )
})

export const Row = memo(RowBase)