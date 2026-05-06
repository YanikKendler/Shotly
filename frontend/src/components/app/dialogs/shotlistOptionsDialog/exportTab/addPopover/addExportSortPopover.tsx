import React, {useRef} from "react"
import SimplePopover, {SimplePopoverRef} from "@/components/basic/popover/simplePopover"
import {ArrowDownUp, Plus} from "lucide-react"
import {AnySceneAttributeDefinition, AnyShotAttributeDefinition, SelectOption} from "@/utility/Types"
import {ExportSort} from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportTab"
import "./exportAddPopover.scss"

export default function AddExportSortPopover({
    sceneAttributeDefinitions,
    shotAttributeDefinitions,
    customSceneSorts,
    customShotSorts,
    addSceneSort,
    addShotSort
}:{
    sceneAttributeDefinitions: AnySceneAttributeDefinition[] | null
    shotAttributeDefinitions: AnyShotAttributeDefinition[] | null
    customSceneSorts: ExportSort[]
    customShotSorts: ExportSort[]
    addSceneSort: (attributeDefinitionId: number) => void
    addShotSort: (attributeDefinitionId: number) => void
}) {
    const popoverRef = useRef<SimplePopoverRef>(null);

    const customSceneSortCandidates = sceneAttributeDefinitions
        ?.filter(attributeDefinition => {
            if(
                customSceneSorts.some(s => s.definitionId == attributeDefinition?.id) ||
                (attributeDefinition as AnySceneAttributeDefinition).type === "SceneTextAttributeDefinitionDTO"
            ) return false
            return true
        })

    const customShotSortCandidates = shotAttributeDefinitions
        ?.filter(attributeDefinition => {
            if(
                customShotSorts.some(s => s.definitionId == attributeDefinition?.id) ||
                (attributeDefinition as AnyShotAttributeDefinition).type === "ShotTextAttributeDefinitionDTO"
            ) return false
            return true
        })

    return (
        <SimplePopover
            ref={popoverRef}
            className={"add"}
            contentClassName={"exportAddPopover"}
            showArrow={false}
            content={<>
                <h3>Scene</h3>
                {
                    !customSceneSortCandidates || customSceneSortCandidates?.length <= 0 ?
                        <p className="empty">None left</p> :
                        customSceneSortCandidates?.map((attributeDefinition, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    addSceneSort(attributeDefinition?.id || -1)
                                    popoverRef.current?.close()
                                }}
                            >
                                {attributeDefinition?.name || "Unnamed"}
                            </button>
                        ))
                }
                <h3>Shot</h3>
                {
                    !customShotSortCandidates || customShotSortCandidates?.length <= 0 ?
                        <p className="empty">None left</p> :
                        customShotSortCandidates.map((attributeDefinition, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    addShotSort(attributeDefinition?.id || -1)
                                    popoverRef.current?.close()
                                }}
                            >
                                {attributeDefinition?.name || "Unnamed"}
                            </button>
                        ))
                }
            </>}
        >
            Add sort <ArrowDownUp size={18}/>
        </SimplePopover>
    )
}