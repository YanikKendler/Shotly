import React, {
    forwardRef,
    memo,
    ReactNode,
    RefObject,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react"
import "./row.scss"
import {Popover} from "radix-ui"
import {
    ArrowBigDown,
    ArrowBigUp,
    GripVertical,
    List,
    MessageSquareText,
    MoveDown,
    MoveUp,
    Trash
} from "lucide-react"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {ShotlistContext} from "@/context/ShotlistContext"
import {CommentDto, ShotDto} from "../../../../../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import Separator from "@/components/basic/separator/separator"
import {
    ShotlistOptionsDialogMainPage,
    ShotlistOptionsDialogSubPage
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {successNotification} from "@/service/NotificationService"
import CellBase from "@/components/app/shotlist/table/cell/cellBase"
import CommentPopover, {CommentPopoverRef} from "@/components/app/shotlist/table/commentPopover/commentPopover"

export interface RowRef {
    id: string,
    closeContextOptions: () => void,
    openContextOptions: () => void,
    commentPopoverRef: RefObject<CommentPopoverRef | null>,
}

export interface RowProps {
    shot: ShotDto
    position: number
    scenePosition: number
    onDelete: (shotId: string) => void
    moveShot: (shotId: string, newPos: number) => void
    isReadOnly: boolean
    children: ReactNode
    setTemporaryPaddingVisible: (visible: boolean) => void
    addCommentToCache: (comment: CommentDto) => void
    updateCommentInCache: (comment: CommentDto) => void
    commentPresentInScene: boolean
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
    setTemporaryPaddingVisible,
    addCommentToCache,
    updateCommentInCache,
    commentPresentInScene
}, ref) => {
    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)

    const [contextOptionsOpen, setContextOptionsOpen] = useState(false)
    const [commentPopoverOpen, setCommentPopoverOpen] = useState(false)

    const [markAsDeleted, setMarkAsDeleted] = useState(false)

    const keybindUnsubscribe = useRef(() => {})

    const commentPopoverRef = useRef<CommentPopoverRef>(null);

    useImperativeHandle(ref, () => ({
        id: shot.id ?? "unknown",
        closeContextOptions: () => setContextOptionsOpen(false),
        openContextOptions: () => setContextOptionsOpen(true),
        commentPopoverRef: commentPopoverRef
    }))

    useEffect(() => {
        setTemporaryPaddingVisible(commentPopoverOpen)
    }, [commentPopoverOpen])

    useEffect(() => {
        keybindUnsubscribe.current()

        if(contextOptionsOpen){
            keybindUnsubscribe.current = tinykeys(window, {
                "C": e => {
                    e.preventDefault()
                    e.stopImmediatePropagation()
                    addComment()
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
                "Delete": e => {
                    e.preventDefault()
                    e.stopImmediatePropagation()
                    deleteShot()
                },
                "E": e => {
                    e.preventDefault()
                    e.stopImmediatePropagation()

                    shotlistContext.openShotlistOptionsDialog({
                        main: ShotlistOptionsDialogMainPage.attributes,
                        sub: ShotlistOptionsDialogSubPage.shot
                    })
                }
            })
        }

        return () => {
            keybindUnsubscribe.current()
        }
    }, [contextOptionsOpen, position, shot.id, moveShot])

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

        successNotification({
            title: "Shot deleted successfully"
        })

        onDelete(shot.id as string)

        shotlistContext.setSaveState("deleteShot", "saved")
    }

    const addComment = () => {
        setCommentPopoverOpen(true)
    }

    return (
    <div
        className={`sheetRow ${(contextOptionsOpen || commentPopoverOpen) && "active"} ${markAsDeleted && "deleting"}`}
        data-shot-id={shot.id}
    >
        <CellBase
            isNumber={true}
            className={"default"}
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
                    <Popover.Trigger className="grip">
                        <GripVertical size={22}/>
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content
                            className="popoverContent shotContextOptionsPopup"
                            align={"center"}
                            onCloseAutoFocus={e => e.preventDefault()}
                            onOpenAutoFocus={e => e.preventDefault()}
                        >
                            {/*<Popover.Close asChild><button disabled={true}><CornerDownRight size={18}/> Make Subshot</button></Popover.Close>*/}

                            <Popover.Close asChild>
                                <button onClick={addComment}>
                                    <MessageSquareText size={18}/>
                                    Comment
                                    <span className="key subtle">C</span>
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
                                <button className={"bad"} onClick={deleteShot}>
                                    <Trash size={18}/>
                                    Delete
                                    <span className="key subtle">Del</span>
                                </button>
                            </Popover.Close>

                            <Separator/>

                            <Popover.Close asChild>
                                <button onClick={() => shotlistContext.openShotlistOptionsDialog({
                                    main: ShotlistOptionsDialogMainPage.attributes,
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
        </CellBase>
        {children}
        {
            <CommentPopover
                ref={commentPopoverRef}
                isOpen={commentPopoverOpen}
                onOpenChange={setCommentPopoverOpen}
                shot={shot}
                scenePosition={scenePosition}
                addCommentToCache={addCommentToCache}
                updateCommentInCache={updateCommentInCache}
                showOnHover={commentPresentInScene}
            />
        }
    </div>
    )
})

export const Row = memo(RowBase)