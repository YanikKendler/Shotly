import { AnyShotAttributeDefinition } from "@/util/Types"
import { ShotAttributeDefinitionParser } from "@/util/AttributeParser"
import { ShotAttributeDefinitionBase } from "../../../../../lib/graphql/generated"
import CellBase from "@/components/shotlist/table/cell/cellBase"

export default function CreatorCell ({
    shotAttributeDefinition,
    createShot,
    isNumber = false,
}:{
    shotAttributeDefinition?: ShotAttributeDefinitionBase
    createShot: () => void
    isNumber?: boolean
}) {
    const attributeDefinition = shotAttributeDefinition as AnyShotAttributeDefinition
    const Icon = ShotAttributeDefinitionParser.toIcon(attributeDefinition)

    return (
        <CellBase
            className={`create`}
            isNumber={isNumber}
            onClick={createShot}
        >
            {
                isNumber ?
                <span>#</span> :
                <>
                    <p>{shotAttributeDefinition?.name || "Unnamed"}</p>
                    <div className="icon">
                        <Icon size={18}/>
                    </div>
                </>
            }
        </CellBase>
    )
}