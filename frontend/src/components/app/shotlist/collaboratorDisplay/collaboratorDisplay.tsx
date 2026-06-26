import {PresentCollaborator} from "../../../../../lib/graphql/generated"
import "./collaboratorDisplay.scss"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"

export default function CollaboratorDisplay({
    collaborators,
}:{
    collaborators: PresentCollaborator[]
}){
    if(collaborators.length == 0) return null

    let content = <div className="collaboratorDisplay">
        {collaborators[0].user?.name?.substring(0, 1)}
        {`+${collaborators.length - 1}`}
    </div>

    if(collaborators.length == 1)
        content = <div className="collaboratorDisplay square">
            {collaborators[0].user?.name?.substring(0, 1)}
        </div>

    return (
        <SimpleTooltip
            text={collaborators.map(c => c.user?.name).join(", ")}
            showOnMobile
            fontSize={0.8}
            delay={0}
        >
            {content}
        </SimpleTooltip>
    )
}