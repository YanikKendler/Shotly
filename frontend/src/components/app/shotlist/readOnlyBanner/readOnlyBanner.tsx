import {ReadOnlyReason} from "@/app/(application)/shotlist/[id]/page"
import {useState} from "react"
import {X} from "lucide-react"
import "./readOnlyBanner.scss"

export default function ReadOnlyBanner({
    isReadOnly,
    readOnlyReason
} : {
    isReadOnly: boolean,
    readOnlyReason: ReadOnlyReason
}) {
    const [bannerHidden, setBannerHidden] = useState(false)

    if(!isReadOnly || bannerHidden) return null

    let humanReadableReason = "[unknown reason]"

    switch (readOnlyReason) {
        case "tooManyShotlists":
            humanReadableReason = 'its owner has exceeded the maximum number of Shotlist available with the basic tier'
            break
        case "collaborationViewOnly":
            humanReadableReason = 'its owner set your collaboration type to "viewer"'
            break
        case "collaborationCommentOnly":
            humanReadableReason = 'its owner set your collaboration type to "commenter"'
            break
        case "archived":
            humanReadableReason = 'it has been marked as archived'
            break
    }

    return (
        <div className="readOnlyBanner">
            <p>
                You can not edit this Shotlist because {humanReadableReason}.
            </p>
            <button
                className={"round"}
                onClick={() => setBannerHidden(true)}
            >
                <X size={16}/>
            </button>
        </div>
    )
}