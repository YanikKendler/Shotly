import { Popover } from "radix-ui"
import "./commentPopover.scss"
import {MessageSquareText, Pencil, Send} from "lucide-react"
import {useContext, useEffect, useRef, useState} from "react"
import {CommentDto, Maybe, ShotDto} from "../../../../../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import {wuConstants, wuText} from "@yanikkendler/web-utils/dist"
import {useApolloClient} from "@apollo/client"
import {ShotlistContext} from "@/context/ShotlistContext"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"
import Comment from "@/components/app/shotlist/table/commentPopover/comment/comment"
import MarkdownEditor, {MarkdownEditorRef} from "@/components/basic/markdownEditor/markdownEditor"

export default function CommentPopover ({
    isOpen,
    onOpenChange,
    shot,
    scenePosition,
    onCreateComment,
    onUpdateComment,
    showOnHover
}:{
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    shot: ShotDto
    scenePosition: number
    onCreateComment: (comment: CommentDto) => void
    onUpdateComment: (comment: CommentDto) => void
    showOnHover: boolean
}) {
    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)

    const [commentText, setCommentText] = useState<string | undefined>("")

    const [comments, setComments] = useState<Maybe<CommentDto>[]>([])

    const contentElementRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<MarkdownEditorRef>(null);

    useEffect(() => {
        setComments(shot?.activeComments ?? [])
    }, [shot]);

    useEffect(() => {
        shotlistContext.blockKeyBinds.current.set("comments", isOpen)
    }, [isOpen]);

    const sendComment = async () => {
        if(!commentText || wuConstants.Regex.empty.test(commentText)) return

        setCommentText("")

        const sanitizedCommentText = await Utils.sanitizeString(commentText)

        const commentId = crypto.randomUUID()

        const newComment = {
            id: commentId,
            shotId: shot.id,
            user: {
                id: shotlistContext.currentUser?.id,
                name: shotlistContext.currentUser?.name ?? "Unknown"
            },
            text: sanitizedCommentText,
            edited: false
        }

        setComments(current => {
            return [
                ...current,
                newComment
            ]
        })

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

    const buttonIsVisible = isOpen || (comments && comments.length > 0 && comments.some(c => !c?.archived))

    return (
        <Popover.Root
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            { (isOpen || showOnHover) &&
                <div className={`commentTriggerWrapper`}>
                    <Popover.Trigger className={`comments ${buttonIsVisible && "visible"} ${showOnHover && "showOnHover"}`}>
                        <MessageSquareText size={16}/>
                    </Popover.Trigger>
                </div>
            }
            <Popover.Portal>
                <Popover.Content
                    ref={contentElementRef}
                    className="popoverContent commentPopover"
                    sideOffset={6}
                    collisionPadding={4}
                    onCloseAutoFocus={e => e.preventDefault()}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault()

                        editorRef.current?.focus()
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
                                    updateComment={(updatedComment) => {
                                        setComments(current => {
                                            return current.map(c => {
                                                if(c?.id == updatedComment?.id) return updatedComment

                                                return c
                                            })
                                        })
                                        onUpdateComment(updatedComment)
                                    }}
                                />
                            ))
                        }
                    </div>
                    <div className="bottom">
                        <MarkdownEditor
                            ref={editorRef}
                            placeholder={"Add a comment..."}
                            value={commentText}
                            onValueChange={setCommentText}
                            actions={[{
                                name: "sendComment",
                                icon: <Send size={16}/>,
                                shortcut: "crtl+m", //TODO
                                label: "Send the comment",
                                disabled: wuConstants.Regex.empty.test(commentText || ""),
                                onClick: sendComment
                            }]}
                            delayClose={true}
                        />
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}