import {ReadOnlyReason} from "@/app/(application)/shotlist/[id]/page"
import Banner from "@/components/basic/banner/banner"

export default function ReadOnlyBanner({
    isReadOnly,
    readOnlyReason
} : {
    isReadOnly: boolean,
    readOnlyReason: ReadOnlyReason
}) {
    if(!isReadOnly) return null

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
        <Banner>
            You can not edit this Shotlist because {humanReadableReason}.
        </Banner>
    )
}