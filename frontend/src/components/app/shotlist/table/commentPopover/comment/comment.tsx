import {CollaborationType, CommentDto} from "../../../../../../../lib/graphql/generated"
import {Check, CircleCheckBig, Pencil, X} from "lucide-react"
import {forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import "./comment.scss"
import {marked} from "marked"
import Utils from "@/utility/Utils"
import {ShotlistContext} from "@/context/ShotlistContext"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import {wuConstants} from "@yanikkendler/web-utils"
import MarkdownEditor, {MarkdownEditorRef} from "@/components/basic/markdownEditor/markdownEditor"
import gql from "graphql-tag"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {useApolloClient} from "@apollo/client"
import {AppContext} from "@/context/AppContext"

export interface CommentRef {
    isBeingEdited: boolean
    hideEditor: () => void
}

export interface CommentProps {
    comment: CommentDto | null
    onUpdateComment: (comment: CommentDto) => void
}

const Comment = forwardRef<CommentRef, CommentProps>(({
    comment,
    onUpdateComment,
}, ref) =>{
    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)
    const appContext = useContext(AppContext)

    const [newCommentText, setNewCommentText] = useState(comment?.text || undefined)

    const [cleanedHTML, setCleanedHTML] = useState("")
    const [isBeingEdited, setIsBeingEdited] = useState(false)

    const editorRef = useRef<MarkdownEditorRef>(null);

    useImperativeHandle(ref, () => ({
        isBeingEdited: isBeingEdited,
        hideEditor: hideEditor
    }))

    useEffect(() => {
        if(comment?.text) {
            const unsafeHTML = marked.parse(Utils.removeZeroWidthChars(comment.text), {breaks: true, gfm: true}) as string
            Utils.sanitizeStringAndOnlyUseSimpleTags(unsafeHTML)
                .then(cleaned => setCleanedHTML(cleaned))
        }
    }, [comment])

    const updateCommentText = async () => {

        if(!newCommentText || wuConstants.Regex.empty.test(newCommentText)) return

        hideEditor()

        if(newCommentText == comment?.text) return

        const sanitizedCommentText = await Utils.sanitizeString(newCommentText)

        onUpdateComment({
            ...comment,
            text: sanitizedCommentText,
            edited: true
        })

        const result = await client.mutate({
            mutation: gql`
                mutation updateComment($id: String!, $text: String!){
                    updateComment(updateDTO:{
                        id: $id,
                        text: $text,
                    }){
                        id
                    }
                }
            `,
            variables: {id: comment?.id, text: sanitizedCommentText},
        })

        if (result.errors) {
            errorNotification({
                title: "Failed to update comment",
                tryAgainLater: true
            })
            console.error(result.errors)
            setIsBeingEdited(true)
            onUpdateComment({
                text: comment?.text
            })
            return
        }

        successNotification({
            title: "Comment updated"
        })
    }

    const archiveComment = async () => {
        onUpdateComment({
            ...comment,
            archived: true
        })

        const result = await client.mutate({
            mutation: gql`
                mutation archiveComment($id: String!){
                    updateComment(updateDTO:{
                        id: $id,
                        isArchived: true,
                    }){
                        id
                    }
                }
            `,
            variables: {id: comment?.id},
        })

        if (result.errors) {
            errorNotification({
                title: "Failed to archive comment",
                tryAgainLater: true
            })
            console.error(result.errors)
            onUpdateComment({
                archived: false
            })
            return
        }

        successNotification({
            title: "Comment archived"
        })
    }

    const toggleEditor = () => {
        if(isBeingEdited) hideEditor()
        else setIsBeingEdited(true)
    }

    const hideEditor = () => {
        editorRef.current?.forceToolBarHidden()
        setTimeout(() => { //wait for toolbar animation to finish
            setIsBeingEdited(false)
        }, 180)
    }

    if(!comment || comment.archived) return null

    const commentOwnedByCurrentUser = comment.owner?.id == appContext.currentUser?.id

    return (
        <div className={`comment ${isBeingEdited && "isBeingEdited"}`}>
            <div className="top">
                <p>
                    { comment?.owner?.name ?? "Unknown" }
                    { comment?.edited && <span className="edited"> (edited)</span> }
                </p>
                {
                    shotlistContext.currentCollaborationType != CollaborationType.View &&
                    <div className="buttons">
                        {
                            commentOwnedByCurrentUser &&
                            <SimpleTooltip text={`${isBeingEdited ? "Cancel" : "Edit"}`} delay={100} fontSize={0.75}>
                                <button onClick={toggleEditor}>
                                    <Pencil size={14}/>
                                </button>
                            </SimpleTooltip>
                        }
                        {
                            (
                                shotlistContext.currentCollaborationType == CollaborationType.Edit
                                ||
                                shotlistContext.currentCollaborationType == CollaborationType.Comment &&
                                commentOwnedByCurrentUser
                            ) &&
                            <SimpleTooltip text={"Completed"} delay={100} fontSize={0.75}>
                                <button onClick={archiveComment}>
                                    <CircleCheckBig size={16}/>
                                </button>
                            </SimpleTooltip>
                        }
                    </div>
                }
            </div>
            {
                isBeingEdited ?
                <MarkdownEditor
                    ref={editorRef}
                    autoFocus={true}
                    placeholder={"Enter comment..."}
                    value={newCommentText}
                    onValueChange={setNewCommentText}
                    shortCharacterCountDisplay={true}
                    actions={[
                        {
                            name: "cancel",
                            icon: <X size={16}/>,
                            label: "Cancel",
                            onClick: hideEditor,
                            className: "small gray",
                            humanReadableShortcut: ["Esc"]
                        },
                        {
                            name: "confirm",
                            icon: <Check size={16}/>,
                            label: "Confirm",
                            disabled: wuConstants.Regex.empty.test(newCommentText || ""),
                            onClick: updateCommentText,
                            className: "small",
                            humanReadableShortcut: ["ctrl", "enter"]
                        }
                    ]}
                    toolbarCanHide={false}
                    onCtrlEnter={updateCommentText}
                /> :
                <div className={"text"} dangerouslySetInnerHTML={{
                    __html: cleanedHTML
                }}></div>
            }
        </div>
    )
})

export default Comment