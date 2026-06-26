import {Popover} from "radix-ui"
import "./commentPopover.scss"
import {MessageSquareText, Send} from "lucide-react"
import {forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import {CollaborationType, CommentDto, Maybe, ShotDto} from "../../../../../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {useApolloClient} from "@apollo/client"
import {ShotlistContext} from "@/context/ShotlistContext"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"
import Comment, {CommentRef} from "@/components/app/shotlist/table/commentPopover/comment/comment"
import MarkdownEditor, {MarkdownEditorRef} from "@/components/basic/markdownEditor/markdownEditor"
import {AppContext} from "@/context/AppContext"

export interface CommentPopoverRef {
    onCreateComment: (comment: CommentDto) => void
    onUpdateComment: (comment: CommentDto) => void
}

export interface CommentPopoverProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    shot: ShotDto
    scenePosition: number
    addCommentToCache: (comment: CommentDto) => void
    updateCommentInCache: (comment: CommentDto) => void
    showOnHover: boolean
}

//TODO docs
const CommentPopover = forwardRef<CommentPopoverRef, CommentPopoverProps>(({
    isOpen,
    onOpenChange,
    shot,
    scenePosition,
    addCommentToCache,
    updateCommentInCache,
    showOnHover
}, ref)=> {
    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)
    const appContext = useContext(AppContext)

    const [commentText, setCommentText] = useState<string | undefined>("")

    const [comments, setComments] = useState<Maybe<CommentDto>[]>([])

    const [badgeVisible, setBadgeVisible] = useState(false)

    const contentElementRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<MarkdownEditorRef>(null)

    const commentRefs = useRef<Map<string, CommentRef | null>>(new Map())

    useImperativeHandle(ref, () => ({
        onCreateComment: onCreateComment,
        onUpdateComment: onUpdateComment
    }))

    useEffect(() => {
        setComments(shot?.activeComments ?? [])
    }, [shot]);

    useEffect(() => {
        if(isOpen) {
            appContext.visibleOverlays.current.set(
                "comments",
                {
                    close: () => onOpenChange(false),
                    usingKeybinds: ["Control+Enter"]
                }
            )
        }
        else {
            appContext.visibleOverlays.current.delete("comments")
        }
    }, [isOpen]);

    useEffect(() => {
        if(!shot.id || !comments || comments.length == 0) return

        const viewTime = shotlistContext.commentThreadViewTime[shot.id]

        const newestValidComment = comments.findLast(c => !c?.archived)

        if(!newestValidComment) return

        if(
            viewTime == undefined ||
            new Date(newestValidComment?.createdAt).getTime() > viewTime
        ){
            setBadgeVisible(true)
        }
        else {
            setBadgeVisible(false)
        }
    }, [comments])

    const sendComment = async () => {
        if(!commentText || wuConstants.Regex.empty.test(commentText)) return

        setCommentText("")

        const sanitizedCommentText = await Utils.sanitizeString(commentText)

        const commentId = crypto.randomUUID()

        const newComment: CommentDto = {
            id: commentId,
            shotId: shot.id,
            sceneId: shot.sceneId,
            owner: {
                id: appContext.currentUser?.id,
                name: appContext.currentUser?.name ?? "Unknown"
            },
            text: sanitizedCommentText,
            edited: false,
            createdAt: Date.now()
        }

        onCreateComment(newComment)

        const result = await client.mutate({
            mutation: gql`
                mutation addComment($id: String!, $shotId: String!, $text: String!){
                    addComment(createDTO:{
                        id: $id,
                        shotId: $shotId,
                        text: $text,
                    }){
                        id
                    }
                }
            `,
            variables: {id: commentId, shotId: shot.id, text: sanitizedCommentText},
        })

        if (result.errors) {
            errorNotification({
                title: "Failed to post comment",
                tryAgainLater: true
            })
            console.error(result.errors)
            setCommentText(commentText)
            setComments(current => {
                const newComments = [...current]
                return newComments.filter(c => c?.id != commentId)
            })
            return
        }
    }

    const onCreateComment = (newComment: CommentDto) => {
        setComments(current => {
            return [
                ...current,
                newComment
            ]
        })

        addCommentToCache(newComment)
    }

    const onUpdateComment = (updatedComment: CommentDto) => {
        setComments(current => {
            return current.map(c => {
                if(c?.id == updatedComment?.id) return updatedComment

                return c
            })
        })
        updateCommentInCache(updatedComment)
    }

    const buttonIsVisible = isOpen || (comments && comments.length > 0 && comments.some(c => !c?.archived))

    return (
        <Popover.Root
            open={isOpen}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen)

                setBadgeVisible(false)
                shotlistContext.viewedCommentThread(shot.id ?? "")
            }}
        >
            {
                (
                    buttonIsVisible
                        ||
                    showOnHover && shotlistContext.currentCollaborationType != CollaborationType.View
                ) &&
                <div className={`commentTriggerWrapper`}>
                    <Popover.Trigger
                        className={`comments ${buttonIsVisible && "visible"} ${showOnHover && "showOnHover"} ${shotlistContext.currentCollaborationType == CollaborationType.Comment && "commenterMode"} noClickFx`}
                    >
                        <MessageSquareText size={16}/>
                        {
                            badgeVisible && !isOpen &&
                            <span className="badge"/>
                        }
                    </Popover.Trigger>
                </div>
            }
            <Popover.Portal>
                <Popover.Content
                    ref={contentElementRef}
                    className="popoverContent commentPopover"
                    sideOffset={6}
                    collisionPadding={10}
                    onCloseAutoFocus={e => e.preventDefault()}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault()

                        editorRef.current?.focus()
                    }}
                    onEscapeKeyDown={e => {
                        if(commentRefs.current.values().some(c => c?.isBeingEdited)) {
                            commentRefs.current.values().forEach(c => c?.hideEditor())
                            e.preventDefault()
                        }
                    }}
                >
                    <div className="top">
                        <p role={"heading"}>Comments • Shot {Utils.numberToShotLetter(shot.position, scenePosition)}</p>
                    </div>
                    <div className="content">
                        {
                            !comments || comments.length <= 0 || comments.every(c => c?.archived) ?
                            <p className="empty">No comments yet</p>
                            :
                            comments.toReversed().map(comment => (
                                <Comment
                                    key={comment?.id}
                                    comment={comment}
                                    onUpdateComment={onUpdateComment}
                                    ref={(node) => {
                                        if(!comment?.id) {
                                            console.error("could not set comment ref")
                                            return
                                        }

                                        commentRefs.current.set(comment.id, node)

                                        return () => {
                                            if(comment?.id)
                                                commentRefs.current.delete(comment.id)
                                        }
                                    }}
                                />
                            ))
                        }
                    </div>
                    <div className="bottom">
                        {
                            shotlistContext.currentCollaborationType == CollaborationType.View
                            ?
                            <p className={"empty"}>You don't have permission to add a comment.</p>
                            :
                            <MarkdownEditor
                                ref={editorRef}
                                placeholder={"Add a comment..."}
                                value={commentText}
                                onValueChange={setCommentText}
                                actions={[{
                                    name: "sendComment",
                                    icon: <Send size={16}/>,
                                    label: "Send the comment",
                                    disabled: wuConstants.Regex.empty.test(commentText || ""),
                                    onClick: sendComment,
                                    humanReadableShortcut: ["Ctrl", "Enter"]
                                }]}
                                delayClose={true}
                                onCtrlEnter={sendComment}
                            />
                        }
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
})

export default CommentPopover