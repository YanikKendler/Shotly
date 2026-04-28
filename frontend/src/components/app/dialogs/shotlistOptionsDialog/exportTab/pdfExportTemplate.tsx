"use client"

/**
 * AI
 * This component was initially written by hand but the pagination logic is almost completely AI generated
 */

import React from 'react'
import {Document, Page, StyleSheet, Text, View} from '@react-pdf/renderer'
import {SceneDto, ShotDto, ShotlistDto} from "../../../../../../lib/graphql/generated"
import {
    AnySceneAttribute,
    AnySceneAttributeDefinition,
    AnyShotAttribute,
    AnyShotAttributeDefinition
} from "@/utility/Types"
import {SceneAttributeParser, ShotAttributeParser} from "@/utility/AttributeParser"
import Utils from "@/utility/Utils"
import {wuConstants, wuGeneral} from "@yanikkendler/web-utils/dist"
import {PdfExportOptions} from "@/service/export/usePdfExport"

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        padding: 20,
        fontSize: 9
    },
    container: {
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000'
    },
    row: {
        display: "flex",
        flexDirection: 'row',
        width: "100%",
        borderTop: '1px solid #000'
    },
    rowOdd: {
        backgroundColor: '#efefef'
    },
    heading: {
        backgroundColor: '#c7c7c7',
        fontWeight: 'bold',
        fontSize: 11
    },
    shotDefinitions: {
        backgroundColor: '#c7c7c7'
    },
    sceneDefinitions: {
        fontSize: 10,
        textAlign: 'center'
    },
    cell: {
        flex: 1,
        borderLeft: '1px solid #000',
        paddingVertical: 2,
        paddingHorizontal: 3,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        height: '100%'
    },
    bigCell: {
        paddingVertical: 4
    },
    number: {
        maxWidth: 30,
        justifyContent: 'center'
    },
    numberAndCheckBox: {
        maxWidth: 44
    },
    checkBox: {
        width: 14,
        maxWidth: 14
    },
    small: {
        fontSize: 9
    },
    bottom: {
        padding: 4,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: "auto"
    },
    bottomBox: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row'
    },
    bottomText: {
        color: 'gray'
    },
    top: {
        marginBottom: 8,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold'
    }
})

interface SceneFragment extends SceneDto {
    fragmentShots: ShotDto[]
    isHeader: boolean
}

// Internal technical constants
const USABLE_HEIGHT = 520
const USABLE_HEIGHT_WITH_HEADER = USABLE_HEIGHT - 30
const SCENE_DEFS_HEIGHT = 16
const SCENE_HEADING_HEIGHT = 22
const SHOT_DEFS_HEIGHT = 15
const BASE_SHOT_HEIGHT = 14
const CHARS_PER_LINE = 40
const AVOID_ORPHANS_THRESHOLD = 3

const estimateShotHeight = (shot: ShotDto): number => {
    let maxLines = 1
    const attributes = (shot.attributes as AnyShotAttribute[]) || []
    attributes.forEach(attr => {
        const val = ShotAttributeParser.toValueString(attr, false)
        const lines = Math.ceil(val.length / CHARS_PER_LINE)
        if (lines > maxLines) maxLines = lines
    })
    return BASE_SHOT_HEIGHT + ((maxLines - 1) * 10)
}

function paginate(data: ShotlistDto, options: PdfExportOptions): SceneFragment[][] {
    const pages: SceneFragment[][] = []
    let currentPage: SceneFragment[] = []
    let currentHeight = 0

    const actualUsableHeight =
        wuConstants.Regex.empty.test(options.headerText)
            ? USABLE_HEIGHT
            : USABLE_HEIGHT_WITH_HEADER

    data.scenes?.forEach((scene) => {
        let shotsToProcess = [...(scene?.shots as ShotDto[] || [])]
        let isFirstFragment = true
        const fullHeaderHeight = SCENE_DEFS_HEIGHT + SCENE_HEADING_HEIGHT + SHOT_DEFS_HEIGHT

        while (shotsToProcess.length > 0) {
            let spaceLeft = actualUsableHeight - currentHeight

            if (isFirstFragment) {
                const minCount = options.avoidOrphans ? AVOID_ORPHANS_THRESHOLD : 1
                const initialBatchHeight = shotsToProcess.slice(0, minCount).reduce((acc, s) => acc + estimateShotHeight(s), 0)
                const minEntryHeight = fullHeaderHeight + initialBatchHeight

                if (currentHeight > 0 && spaceLeft < minEntryHeight) {
                    pages.push(currentPage); currentPage = []; currentHeight = 0; spaceLeft = actualUsableHeight
                }

                let fragmentShots: ShotDto[] = []
                let fragmentHeight = fullHeaderHeight

                while (shotsToProcess.length > 0) {
                    const nextShotHeight = estimateShotHeight(shotsToProcess[0])
                    if (fragmentHeight + nextShotHeight > spaceLeft) {
                        if (options.avoidOrphans && shotsToProcess.length <= AVOID_ORPHANS_THRESHOLD && currentHeight > 0) {
                            pages.push(currentPage); currentPage = []; currentHeight = 0; spaceLeft = actualUsableHeight
                            fragmentHeight = fullHeaderHeight
                            continue
                        }
                        break
                    }
                    fragmentHeight += nextShotHeight
                    fragmentShots.push(shotsToProcess.shift()!)
                }

                currentPage.push({ ...scene, fragmentShots, isHeader: true } as SceneFragment)
                currentHeight += fragmentHeight
                isFirstFragment = false
            } else {
                if (currentHeight >= actualUsableHeight - BASE_SHOT_HEIGHT) {
                    pages.push(currentPage); currentPage = []; currentHeight = 0; spaceLeft = actualUsableHeight
                }

                let fragmentShots: ShotDto[] = []
                // Add height of repeated headings if the option is toggled
                const repeatHeaderHeight = options.repeatSceneHeading ? (SCENE_HEADING_HEIGHT + SHOT_DEFS_HEIGHT) : 0
                const repeatDefHeight = (options.repeatSceneHeading && options.repeatAttributeDefinitions) ? SCENE_DEFS_HEIGHT : 0

                let fragmentHeight = repeatHeaderHeight + repeatDefHeight

                while (shotsToProcess.length > 0) {
                    const nextShotHeight = estimateShotHeight(shotsToProcess[0])
                    if (fragmentHeight + nextShotHeight > spaceLeft) break
                    fragmentHeight += nextShotHeight
                    fragmentShots.push(shotsToProcess.shift()!)
                }

                currentPage.push({ ...scene, fragmentShots, isHeader: false } as SceneFragment)
                currentHeight += fragmentHeight
            }

            if (currentHeight >= actualUsableHeight - BASE_SHOT_HEIGHT) {
                pages.push(currentPage); currentPage = []; currentHeight = 0
            }
        }
    })

    if (currentPage.length > 0) pages.push(currentPage)
    return pages
}

export default function PdfExportTemplate({ data, options }: { data: ShotlistDto | null, options: PdfExportOptions }) {
    if (!data) return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text>shotlist data was not loaded</Text>
            </Page>
        </Document>
    )

    const pages = paginate(data, options)
    const { showCheckboxes, repeatSceneHeading, repeatAttributeDefinitions, headerText } = options

    return (
        <Document>
            {pages.map((pageContent, pIdx) => (
                <Page key={pIdx} size="A4" orientation="landscape" style={styles.page}>
                    {
                        wuConstants.Regex.empty.test(headerText) ? null :
                        <View style={styles.top} fixed>
                            <Text>{headerText}</Text>
                        </View>
                    }

                    <View style={styles.container}>
                        {((pIdx === 0) || (repeatAttributeDefinitions)) && (
                            <View style={[styles.row, styles.sceneDefinitions]}>
                                <Text style={[styles.cell, styles.number, styles.small, showCheckboxes ? styles.numberAndCheckBox : {}]}>Scene</Text>
                                {(data.sceneAttributeDefinitions as AnySceneAttributeDefinition[]).map((attr) => (
                                    <Text style={[styles.cell]} key={attr.id}>{attr.name || "Unnamed"}</Text>
                                ))}
                            </View>
                        )}
                        {pageContent.map((fragment, fIdx) => (
                            <View key={`${pIdx}-${fIdx}`}>
                                {(fragment.isHeader || repeatSceneHeading) && (
                                    <>

                                        <View style={[styles.row, styles.heading]}>
                                            <View style={[styles.cell, styles.bigCell, styles.number, showCheckboxes ? styles.numberAndCheckBox : {}]}>
                                                <Text>{fragment.position + 1}</Text>
                                            </View>
                                            {(fragment.attributes as AnySceneAttribute[])?.map(attr =>
                                                <View style={[styles.cell, styles.bigCell]} key={attr.id}>
                                                    <Text>{SceneAttributeParser.toValueString(attr, false)}</Text>
                                                </View>
                                            )}
                                        </View>

                                        <View style={[styles.row, styles.shotDefinitions]}>
                                            <View style={[styles.cell, styles.number, showCheckboxes ? styles.numberAndCheckBox : {}]}>
                                                <Text>Shot</Text>
                                            </View>
                                            {(data.shotAttributeDefinitions as AnyShotAttributeDefinition[]).map((attr) => (
                                                <View style={[styles.cell]} key={attr.id}>
                                                    <Text>{attr.name || "Unnamed"}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                )}

                                {fragment.fragmentShots.map((shot, sIdx) => (
                                    <View style={[styles.row, sIdx % 2 === 0 ? styles.rowOdd : {}]} key={shot.id} wrap={false}>
                                        {showCheckboxes && <View style={[styles.cell, styles.checkBox]}/>}
                                        <View style={[styles.cell, styles.number]}>
                                            <Text>{Utils.numberToShotLetter(shot.position, fragment.position)}</Text>
                                        </View>
                                        {(shot.attributes as AnyShotAttribute[])?.map((attr) => (
                                            <View style={[styles.cell]} key={attr.id}>
                                                <Text>{ShotAttributeParser.toValueString(attr, false)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>

                    <View style={styles.bottom} fixed>
                        <View style={[styles.bottomBox, {justifyContent: 'flex-start'}]}>
                            <Text style={styles.bottomText}>{data?.name || "Unnamed Shotlist"}</Text>
                        </View>
                        <View style={[styles.bottomBox, {justifyContent: 'center'}]}>
                            <Text style={styles.bottomText}>created with &lt;3 using shotly.at</Text>
                        </View>
                        <View style={[styles.bottomBox, {justifyContent: 'flex-end'}]}>
                            <Text style={styles.bottomText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}/>
                        </View>
                    </View>
                </Page>
            ))}
        </Document>
    )
}