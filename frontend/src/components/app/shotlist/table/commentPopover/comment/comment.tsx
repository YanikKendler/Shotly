import {CommentDto} from "../../../../../../../lib/graphql/generated"
import {CircleCheck, CircleCheckBig, Pencil} from "lucide-react"
import {useContext, useEffect, useState} from "react"
import "./comment.scss"
import {marked} from "marked"
import Utils from "@/utility/Utils"
import {ShotlistContext} from "@/context/ShotlistContext"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"

export default function Comment({
    comment,
}:{
    comment: CommentDto | null
}){
    const shotlistContext = useContext(ShotlistContext)

    const [cleanedHTML, setCleanedHTML] = useState("")
    const [isBeingEdited, setIsBeingEdited] = useState(false)
    if(!comment) return null

    useEffect(() => {
        if(comment.text) {
            const unsafeHTML = marked.parse(Utils.removeZeroWidthChars(comment.text)) as string
            Utils.sanitizeStringAndOnlyUseSimpleTags(unsafeHTML)
                .then(cleaned => setCleanedHTML(cleaned))
        }
    }, [comment.text])

    return (
        <div className="comment" key={comment?.id ?? ""}>
            <div className="top">
                <p>
                    {comment?.user?.name ?? "Unknown"}
                    { comment?.edited && <span className="edited"> (edited)</span> }
                </p>
                {
                    comment.user?.id == shotlistContext.currentUser?.id &&
                    <div className="buttons">
                        <SimpleTooltip text={"Edit"} delay={100} fontSize={0.75}>
                            <button onClick={() => setIsBeingEdited(true)}>
                                <Pencil size={14}/>
                            </button>
                        </SimpleTooltip>
                        <SimpleTooltip text={"Completed"} delay={100} fontSize={0.75}>
                            <button onClick={() => {}}>
                                <CircleCheckBig size={16}/>
                            </button>
                        </SimpleTooltip>
                    </div>
                }
            </div>
            <div className={"text"} dangerouslySetInnerHTML={{
                __html: cleanedHTML
            }}></div>
        </div>
    )
}