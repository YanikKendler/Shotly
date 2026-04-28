"use client"

import React, {RefObject, useEffect, useRef} from 'react'
import {
    AnySceneAttribute,
    AnySceneAttributeDefinition,
    AnyShotAttribute,
    AnyShotAttributeDefinition
} from "@/utility/Types"
import { SceneAttributeParser, ShotAttributeParser } from "@/utility/AttributeParser"
import Utils from "@/utility/Utils"
import { ShotlistDto, SceneDto, ShotDto } from "../../../../../../../lib/graphql/generated"
import "./exportPreview.scss"
import {Download, Eye, RotateCcw, X} from "lucide-react"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"

//AI generated conversion of PdfExportTemplate.tsx + partially vibe coded adjustments
export default function ExportPreview({
    data,
    exportShotlist
}:{
    data: ShotlistDto | null
    exportShotlist: () => void
}) {
    const dialogRef = useRef<DialogRef>(null);

    if (!data) return <div className="empty">Sorry! Data could not be loaded. Please try again.</div>

    const sceneDefs = data.sceneAttributeDefinitions as AnySceneAttributeDefinition[] || []
    const shotDefs = data.shotAttributeDefinitions as AnyShotAttributeDefinition[] || []

    return (
        <>
            <button className="secondary" onClick={dialogRef.current?.open}>
                <span>Preview</span> <Eye size={16} strokeWidth={2.5}/>
            </button>
            <Dialog contentClassName={"pdfPreviewDialogContent"} ref={dialogRef}>
                <div className="top sticky">
                    <h1>Export preview</h1>
                    <button
                        className={"export"}
                        onClick={() => {
                            dialogRef.current?.close()
                            exportShotlist()
                        }}
                    >
                        <span>Download shotlist</span><Download size={16} strokeWidth={3}/>
                    </button>
                    <button className={"close"} onClick={dialogRef.current?.close}>
                        <span>Close preview</span><X size={18} strokeWidth={3}/>
                    </button>
                </div>
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
                <p className="small">If a collaborator has edited the shotlist, the preview might not be fully up to date, but the final export will be.</p>
            </Dialog>
        </>
    )
}