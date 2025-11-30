import {Download, File, ListOrdered, Plus} from "lucide-react"
import React, {useEffect, useRef, useState} from "react"
import gql from "graphql-tag"
import {pdf} from "@react-pdf/renderer"
import PDFExport from "@/components/PDFExport"
import {wuTime} from "@yanikkendler/web-utils"
import {useApolloClient} from "@apollo/client"
import {SceneDto, ShotDto, ShotlistDto} from "../../../../../lib/graphql/generated"
import "./exportTab.scss"
import SimpleSelect from "@/components/simpleSelect/simpleSelect"
import {
    AnySceneAttribute,
    AnySceneAttributeDefinition,
    AnyShotAttribute,
    AnyShotAttributeDefinition,
    SelectOption
} from "@/util/Types"
import Utils from "@/util/Utils"
import MultiSelect from "@/components/multiSelect/multiSelect"
import {SceneAttributeParser, ShotAttributeParser} from "@/util/AttributeParser"
//@ts-ignore
import Loader from "@/components/loader/loader"
import {downloadCSV} from "@/downloadCSV"

type SelectedFileTypes = "PDF" | "CSV-small" | "CSV-full"

export default function ExportTab({shotlist}: { shotlist: ShotlistDto | null}) {
    const [selectedFileType, setSelectedFileType] = useState<SelectedFileTypes>("PDF")
    const [sceneOptions, setSceneOptions] = useState<SelectOption[]>([{value: "this is bad", label: "1"}]);
    const [selectedScenes, setSelectedScenes] = useState<number[]>([]);

    const client = useApolloClient()

    useEffect(() => {
        if (!shotlist) return;

        let newSceneOptions: SelectOption[] = [];
        for (let i = 0; i < shotlist.sceneCount; i++) {
            newSceneOptions.push({value: i.toString(), label: `${(i + 1).toString()}`});
        }
        setSceneOptions(newSceneOptions)
    }, [shotlist]);

    async function getData() {
        if(!shotlist) return null;

        const {data, error, loading} = await client.query({
                query: gql`
                    query shotlistForExport($id: String!) {
                        shotlist(id: $id){
                            id
                            name
                            scenes{
                                id
                                position
                                attributes{
                                    id
                                    definition{id, name, position}

                                    ... on SceneSingleSelectAttributeDTO{
                                        singleSelectValue{id,name}
                                    }

                                    ... on SceneMultiSelectAttributeDTO{
                                        multiSelectValue{id,name}
                                    }
                                    ... on SceneTextAttributeDTO{
                                        textValue
                                    }
                                }
                                shots {
                                    id
                                    position
                                    attributes{
                                        id
                                        definition{id, name, position}

                                        ... on ShotSingleSelectAttributeDTO{
                                            singleSelectValue{id,name}
                                        }

                                        ... on ShotMultiSelectAttributeDTO{
                                            multiSelectValue{id,name}
                                        }
                                        ... on ShotTextAttributeDTO{
                                            textValue
                                        }
                                    }
                                }
                            }
                            sceneAttributeDefinitions{
                                id
                                name
                            }
                            shotAttributeDefinitions{
                                id
                                name
                            }
                        }
                    }`,
                variables: {id: shotlist.id},
                fetchPolicy: "no-cache"
            }
        )

        let filteredScenes= data.shotlist.scenes as SceneDto[]
        if(selectedScenes.length > 0)
            filteredScenes = (data.shotlist.scenes as SceneDto[]).filter((scene) => selectedScenes.includes(scene.position))

        return {...data.shotlist, scenes: filteredScenes} as ShotlistDto;
    }

    async function exportShotlist() {
        const data: ShotlistDto | null = await getData()

        if (!data) {
            console.error("No data found for export");
            return;
        }

        switch (selectedFileType) {
            case "CSV-small":
                exportCSVSmall(data)
                break
            case "CSV-full":
                exportCSVFull(data)
                break
            case "PDF":
                exportPDF(data)
                break
        }
    }

    function exportCSVSmall(data: ShotlistDto){
        let smallData: string[][] = []

        let header: string[] = ["Shot"]; //this semicolon is actually needed :3 (typescript stupid)
        (data.shotAttributeDefinitions as AnyShotAttributeDefinition[]).forEach(attr => {
            header.push(attr.name || "Unnamed")
        }); //this one too

        (data.scenes as SceneDto[]).forEach((scene) => {
            (scene.shots as ShotDto[]).forEach(shot => {
                let row: string[] = [scene.position + 1 + Utils.numberToShotLetter(shot.position)]; //mmh

                (shot.attributes as AnyShotAttribute[]).forEach(attribute => {
                    row.push(ShotAttributeParser.toValueString(attribute, false))
                })
                smallData.push(row)
            })
        })

        downloadCSV(smallData, header, ";", generateFileName())
    }

    function exportCSVFull(data: ShotlistDto){
        let fullData: string[][] = []

        let sceneHeader: string[] = ["Scene"]; //ts :(
        (data.sceneAttributeDefinitions as AnySceneAttributeDefinition[]).forEach(attr => {
            sceneHeader.push(attr.name || "Unnamed")
        });

        let shotHeader: string[] = ["Shot"]; //hrmmm
        (data.shotAttributeDefinitions as AnyShotAttributeDefinition[]).forEach(attr => {
            shotHeader.push(attr.name || "Unnamed")
        });

        (data.scenes as SceneDto[]).forEach((scene) => {
            let sceneRow: string[] = ["Scene " + (scene.position + 1)]; // :(
            (scene.attributes as AnySceneAttribute[]).forEach((attribute) => {
                sceneRow.push(SceneAttributeParser.toValueString(attribute, false))
            })
            fullData.push(sceneRow)
            fullData.push(shotHeader); //...

            (scene.shots as ShotDto[]).forEach(shot => {
                let row: string[] = [Utils.numberToShotLetter(shot.position)]; //hrmpf

                (shot.attributes as AnyShotAttribute[]).forEach(attribute => {
                    row.push(ShotAttributeParser.toValueString(attribute, false))
                })
                fullData.push(row)
            })
        })

        downloadCSV(fullData, sceneHeader, ";", generateFileName())
    }

    async function exportPDF(data: ShotlistDto){
        const blob = await pdf(<PDFExport data={data}/>).toBlob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = generateFileName() + ".pdf"
        link.click()
        URL.revokeObjectURL(url)
    }

    function generateFileName() {
        return `shotly_${shotlist?.name?.replace(/\s/g, "-") || "unnamed-shotlist"}_${wuTime.toFullDateTimeString(Date.now(), {timeSeparator: "-", dateSeparator: "-", dateTimeSeparator: "_", showMilliseconds: false}).replace(/\s/g, "_")}`
    }

    if(!shotlist) return <Loader text={"loading shotlist export"}/>

    return (
        <div className={"shotlistOptionsDialogExportTab"}>
            <h2>Configure the export</h2>
            <div className="filters">
                <div className="filter">
                    <div className="left">
                        <File/>
                        <p>Format</p>
                    </div>

                    <SimpleSelect
                        name="File Type"
                        onChange={newValue => setSelectedFileType(newValue as SelectedFileTypes)}
                        options={[
                            {value: "PDF", label: "PDF"},
                            {value: "CSV-full", label: "CSV (full)"},
                            {value: "CSV-small", label: "CSV (shots only)"},
                        ]}
                        value={"PDF"}
                        fontSize={".95rem"}
                    />
                </div>
                <div className="filter">
                    <div className="left">
                        <ListOrdered size={22}/>
                        <p>Scenes</p>
                    </div>

                    <MultiSelect
                        name={"Scenes"}
                        placeholder={"All Scenes"}
                        options={sceneOptions}
                        onChange={newValue => {
                            setSelectedScenes(newValue.map((option: SelectOption) => parseInt(option.value)))
                        }}
                        sorted={true}
                        minWidth={"20rem"}
                    />
                </div>
                {/*TODO custom filters*/}
                {/*<button className="addFilter">add filter<Plus size={16}/></button>*/}
            </div>
            <button className={"export"} onClick={exportShotlist}>download shotlist<Download size={16} strokeWidth={3}/></button>
        </div>
    )
}