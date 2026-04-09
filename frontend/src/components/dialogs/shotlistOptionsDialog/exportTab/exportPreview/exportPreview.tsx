"use client"

import React from 'react'
import {
    AnySceneAttribute,
    AnySceneAttributeDefinition,
    AnyShotAttribute,
    AnyShotAttributeDefinition
} from "@/util/Types"
import { SceneAttributeParser, ShotAttributeParser } from "@/util/AttributeParser"
import Utils from "@/util/Utils"
import { ShotlistDto, SceneDto, ShotDto } from "../../../../../../lib/graphql/generated"
import "./exportPreview.scss"

//AI generated conversion of PDFExport.tsx + partially vibe coded adjustments
export default function ExportPreview({
    data
}:{
    data: ShotlistDto | null
}) {
    if (!data) return <div className="empty">Sorry! Data could not be loaded. Please try again.</div>

    const sceneDefs = data.sceneAttributeDefinitions as AnySceneAttributeDefinition[] || []
    const shotDefs = data.shotAttributeDefinitions as AnyShotAttributeDefinition[] || []

    return (
        <div className="exportPreview">
            {/* Top Level Scene Attribute Names */}
            <div className="row sceneAttributeDefinitions">
                <div className="cell numberCell">Scene</div>
                {sceneDefs.map((attr) => (
                    <div className="cell" key={attr.id} title={attr.name ?? ""}>
                        {attr.name || "Unnamed"}
                    </div>
                ))}
            </div>

            {(data.scenes as SceneDto[])?.map((scene: SceneDto) => (
                <div className="sceneGroup" key={scene.id}>
                    {/* Scene Content Row */}
                    <div className="row header sceneAttributes">
                        <div className="cell numberCell">{scene.position + 1}</div>
                        {(scene.attributes as AnySceneAttribute[])?.map(attr => (
                            <div className="cell" key={attr.id}>
                                {SceneAttributeParser.toValueString(attr, false)}
                            </div>
                        ))}
                    </div>

                    {/* Shot Sub-Header (Attribute Names) */}
                    <div className="row header shotAttributeDefinitions">
                        <div className="cell numberCell">Shot</div>
                        {shotDefs.map((attr) => (
                            <div className="cell" key={attr.id} title={attr.name ?? ""}>
                                {attr.name || "Unnamed"}
                            </div>
                        ))}
                    </div>

                    {/* Shots for this Scene */}
                    {(scene.shots as ShotDto[])?.map((shot, shIdx) => (
                        <div
                            key={shot.id}
                            className={`row shotRow ${shIdx % 2 !== 0 ? 'rowOdd' : ''}`}
                        >
                            <div className="cell numberCell">
                                {Utils.numberToShotLetter(shot.position, scene.position)}
                            </div>
                            {(shot.attributes as AnyShotAttribute[])?.map((attr) => (
                                <div className="cell" key={attr.id}>
                                    {ShotAttributeParser.toValueString(attr, false)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}