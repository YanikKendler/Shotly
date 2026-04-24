import {ReadOnlyState} from "@/app/shotlist/[id]/page"
import {useState} from "react"
import {X} from "lucide-react"
import "./readOnlyBanner.scss"

export default function ReadOnlyBanner({
    readOnlyState
} : {
    readOnlyState: ReadOnlyState;
}) {
    const [bannerVisible, setBannerVisible] = useState(true)

    if(!readOnlyState.isReadOnly || !bannerVisible) return null

    let readOnlyReason = "[unknown reason]"

    switch (readOnlyState.reason) {
        case "tooManyShotlists":
            readOnlyReason = 'the shotlists owner has exceeded the maximum number of Shotlist available with the basic tier'
            break
        case "collaborationViewOnly":
            readOnlyReason = 'the shotlists owner set your collaboration type to "viewer"'
            break
        case "archived":
            readOnlyReason = 'it has been marked as archived'
            break
    }

    return (
        <div className="readOnlyBanner">
            <p>
                This Shotlist is in <span className={"bold"}>read-only</span> mode because {readOnlyReason}.
            </p>
            <button
                className={"round"}
                onClick={() => setBannerVisible(false)}
            >
                <X size={16}/>
            </button>
        </div>
    )
}