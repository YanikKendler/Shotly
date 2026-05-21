import React, {useRef} from "react"
import SimplePopover, {SimplePopoverRef} from "@/components/basic/popover/simplePopover"
import {ListFilter, ListFilterPlus, Plus} from "lucide-react"
import {AnySceneAttributeDefinition, AnyShotAttributeDefinition, SelectOption} from "@/utility/Types"
import {MultiValue} from "react-select"
import "./exportAddPopover.scss"
import {ExportFilterSetting} from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportTab"

export default function AddExportFilterPopover({
    sceneAttributeDefinitions,
    shotAttributeDefinitions,
    customSceneFilters,
    customShotFilters,
    addSceneFilter,
    addShotFilter
}:{
    sceneAttributeDefinitions: AnySceneAttributeDefinition[] | null
    shotAttributeDefinitions: AnyShotAttributeDefinition[] | null
    customSceneFilters: ExportFilterSetting[]
    customShotFilters: ExportFilterSetting[]
    addSceneFilter: (attributeDefinitionId: number) => void
    addShotFilter: (attributeDefinitionId: number) => void
}) {
    const popoverRef = useRef<SimplePopoverRef>(null);

    const customSceneFilterCandidates = sceneAttributeDefinitions
        ?.filter(attributeDefinition => {
            if(
                customSceneFilters.some(f => f.definitionId == attributeDefinition?.id) ||
                (attributeDefinition as AnySceneAttributeDefinition).type === "SceneTextAttributeDefinitionDTO"
            ) return false
            return true
        })

    const customShotFilterCandidates = shotAttributeDefinitions
        ?.filter(attributeDefinition => {
            if(
                customShotFilters.some(f => f.definitionId == attributeDefinition?.id) ||
                (attributeDefinition as AnyShotAttributeDefinition).type === "ShotTextAttributeDefinitionDTO"
            ) return false
            return true
        })

    return (
        <SimplePopover
            ref={popoverRef}
            className={"add"}
            contentClassName={"exportAddPopover"}
            content={<>
                <h3>Scene</h3>
                {
                    !customSceneFilterCandidates || customSceneFilterCandidates?.length <= 0 ?
                        <p className="empty">None left</p> :
                        customSceneFilterCandidates?.map((attributeDefinition, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    addSceneFilter(attributeDefinition?.id || -1)
                                    popoverRef.current?.close()
                                }}
                            >
                                {attributeDefinition?.name || "Unnamed"}
                            </button>
                        ))
                }
                <h3>Shot</h3>
                {
                    !customShotFilterCandidates || customShotFilterCandidates?.length <= 0 ?
                        <p className="empty">None left</p> :
                        customShotFilterCandidates.map((attributeDefinition, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    addShotFilter(attributeDefinition?.id || -1)
                                    popoverRef.current?.close()
                                }}
                            >
                                {attributeDefinition?.name || "Unnamed"}
                            </button>
                        ))
                }
            </>}
        >
            Add filter <ListFilter size={18}/>
        </SimplePopover>
    )
}