import {SceneDto, ShotDto, ShotlistDto} from "../../../lib/graphql/generated"
import {SceneAttributeParser, ShotAttributeParser} from "@/utility/AttributeParser"
import Utils from "@/utility/Utils"
import {
    AnySceneAttribute,
    AnySceneAttributeDefinition,
    AnyShotAttribute,
    AnyShotAttributeDefinition
} from "@/utility/Types"
import {downloadCSV} from "../../../lib/downloadCSV"
import {RefObject} from "react"

export default function useCsvExport({
    generateFileName,
    hideSceneHeadings,
    scenePositionLUT
}:{
    generateFileName: () => string
    hideSceneHeadings: boolean
    scenePositionLUT: RefObject<Map<string, number>>
}){
    const exportCsv =(data: ShotlistDto) =>{
        let sceneHeader: string[] = ["Scene"]; //ts :(
        (data.sceneAttributeDefinitions as AnySceneAttributeDefinition[]).forEach(attr => {
            sceneHeader.push(attr.name || "Unnamed")
        });

        let shotHeader: string[] = ["Shot"]; //hrmmm
        (data.shotAttributeDefinitions as AnyShotAttributeDefinition[]).forEach(attr => {
            shotHeader.push(attr.name || "Unnamed")
        });

        let fullData: string[][] = [];
        (data.scenes as SceneDto[]).forEach((scene) => {
            if(!hideSceneHeadings) {
                let sceneRow: string[] = ["Scene " + (scene.position + 1)]; // :(
                (scene.attributes as AnySceneAttribute[]).forEach((attribute) => {
                    sceneRow.push(SceneAttributeParser.toValueString(attribute, false))
                })
                fullData.push(sceneRow)
            }

            fullData.push(shotHeader); //...

            (scene.shots as ShotDto[]).forEach(shot => {
                let row: string[] = [Utils.numberToShotLetter(
                    shot.position,
                    scenePositionLUT.current.get(shot.sceneId ?? "") ?? -1,
                    hideSceneHeadings ? true : undefined
                )]; //hrmpf

                (shot.attributes as AnyShotAttribute[]).forEach(attribute => {
                    row.push(ShotAttributeParser.toValueString(attribute, false))
                })
                fullData.push(row)
            })
        })

        downloadCSV(
            fullData,
            !hideSceneHeadings ? sceneHeader : undefined,
            ";",
            generateFileName()
        )
    }

    return {exportCsv}
}