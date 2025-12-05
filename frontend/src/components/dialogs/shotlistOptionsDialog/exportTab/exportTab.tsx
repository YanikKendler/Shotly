import {ChevronDown, Download, File, List, ListOrdered, Plus, Trash, Type, X} from "lucide-react"
import React, {useEffect, useRef, useState} from "react"
import gql from "graphql-tag"
import {pdf} from "@react-pdf/renderer"
import PDFExport from "@/components/PDFExport"
import {wuTime} from "@yanikkendler/web-utils"
import {useApolloClient} from "@apollo/client"
import {
    SceneAttributeType,
    SceneDto,
    ShotDto,
    ShotlistDto,
    ShotSelectAttributeOptionDefinition
} from "../../../../../lib/graphql/generated"
import "./exportTab.scss"
import SimpleSelect from "@/components/inputs/simpleSelect/simpleSelect"
import {
    AnySceneAttribute,
    AnySceneAttributeDefinition,
    AnyShotAttribute,
    AnyShotAttributeDefinition,
    SelectOption, ShotSingleOrMultiSelectAttribute, ShotSingleOrMultiSelectAttributeDefinition
} from "@/util/Types"
import Utils from "@/util/Utils"
import MultiSelect from "@/components/inputs/multiSelect/multiSelect"
import {SceneAttributeParser, ShotAttributeDefinitionParser, ShotAttributeParser} from "@/util/AttributeParser"
//@ts-ignore
import Loader from "@/components/feedback/loader/loader"
import {downloadCSV} from "@/downloadCSV"
import {Popover, Separator} from "radix-ui"
import {MultiValue} from "react-select"

type SelectedFileTypes = "PDF" | "CSV-small" | "CSV-full"

export default function ExportTab(
    {
        shotlist,
        shotAttributeDefinitions
    }:
    {
        shotlist: ShotlistDto | null
        shotAttributeDefinitions?: AnyShotAttributeDefinition[] | null
    }
) {
    const [selectedFileType, setSelectedFileType] = useState<SelectedFileTypes>("PDF")
    const [sceneOptions, setSceneOptions] = useState<SelectOption[]>([{value: "this is bad", label: "1"}])
    const [selectedScenes, setSelectedScenes] = useState<number[]>([])
    const [customFilters, setCustomFilters] = useState<Map<number, number[]>>(new Map())

    const client = useApolloClient()

    useEffect(() => {
        if (!shotlist) return;

        let newSceneOptions: SelectOption[] = [];
        for (let i = 0; i < (shotlist?.sceneCount || 0); i++) {
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
            filteredScenes = (data.shotlist.scenes as SceneDto[])
                .filter((scene) => selectedScenes.includes(scene.position))

        filteredScenes.forEach(scene => {
            if(!scene.shots || scene.shots.length == 0) return

            const filteredShots: ShotDto[] = []

            scene.shots.forEach(shot => {
                if(!shot) return

                const matchesFilters = (shot.attributes as AnyShotAttribute[]).every(attribute => {
                    if(!customFilters.has(attribute.definition?.id)) return true

                    const filter = customFilters.get(attribute.definition?.id)
                    if(!filter) return true

                    switch (attribute.__typename){
                        case "ShotSingleSelectAttributeDTO":
                            const singleValueId = attribute.singleSelectValue?.id
                            if(filter.includes(singleValueId)) {
                                return true
                            }
                            break
                        case "ShotMultiSelectAttributeDTO":
                            const multiValue = attribute.multiSelectValue
                            if(multiValue?.some(value =>
                                filter.includes(value?.id))
                            ) {
                                return true
                            }
                            break
                    }

                    return false
                })

                if(matchesFilters){
                    filteredShots.push(shot)
                }
            })

            scene.shots = filteredShots;
        })

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

    const exportCSVSmall = (data: ShotlistDto) =>{
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

    const exportCSVFull =(data: ShotlistDto) =>{
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

    const generateFileName = () => {
        return `shotly_${shotlist?.name?.replace(/\s/g, "-") || "unnamed-shotlist"}_${wuTime.toFullDateTimeString(Date.now(), {timeSeparator: "-", dateSeparator: "-", dateTimeSeparator: "_", showMilliseconds: false}).replace(/\s/g, "_")}`
    }

    const addFilter = (attributeDefinitionId: number) => {
        const newCustomFilters = new Map(customFilters)
        newCustomFilters.set(attributeDefinitionId, [])
        setCustomFilters(newCustomFilters)
    }

    const setFilterValue = (attributeDefinitionId: number, values: number[]) => {
        const newCustomFilters = new Map(customFilters)
        newCustomFilters.set(attributeDefinitionId, values)
        setCustomFilters(newCustomFilters)
    }

    const removeFilter = (attributeDefinitionId: number) => {
        const newCustomFilters = new Map(customFilters)
        newCustomFilters.delete(attributeDefinitionId)
        setCustomFilters(newCustomFilters)
    }

    if(!shotlist) return <Loader text={"loading shotlist export"}/>

    const customFilterCandidates = shotAttributeDefinitions
        ?.filter(attributeDefinition => {
            console.log(attributeDefinition)
            if(customFilters.has(attributeDefinition?.id)) return false
            if((attributeDefinition as AnyShotAttributeDefinition).__typename === "ShotTextAttributeDefinitionDTO") return false
            return true
        })

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

                <Separator.Separator orientation="horizontal" className={"Separator"}/>


                {Array.from(customFilters).map((filter, index) => {
                    const definition = shotAttributeDefinitions?.find(def => def?.id === filter[0]) as ShotSingleOrMultiSelectAttributeDefinition
                    const Icon = ShotAttributeDefinitionParser.toIcon(definition)

                    return (<>
                        <div className="filter" key={filter[0]}>
                            <div className="left">
                                <Icon size={22}/>
                                <p>{definition.name || "Unnamed"}</p>
                            </div>

                            <div className="right">
                                <MultiSelect
                                    name={definition.name || "Unnamed"}
                                    placeholder={"All " + definition.name || "Unnamed" + "s"}
                                    options={
                                        (definition.options as ShotSelectAttributeOptionDefinition[])
                                            ?.map(option =>
                                                ({value: option.id.toString(), label: option.name || "Unnamed"})
                                            ) || []
                                    }
                                    onChange={newValue => {
                                        setFilterValue(definition.id, newValue.map((option: SelectOption) => parseInt(option.value)))
                                    }}
                                    sorted={true}
                                    minWidth={"20rem"}
                                />

                                <button
                                    className="remove bad"
                                    onClick={() => removeFilter(definition.id)}
                                >
                                    <X size={18}/>
                                </button>
                            </div>
                        </div>
                        {/*TODO finish this dude*/}
                        {customFilters.size > index+1 && <p>and</p>}
                    </>)
                })}
            </div>

            <Popover.Root>
                <Popover.Trigger className={"addFilter"} disabled={customFilterCandidates?.length == 0}>Add filter<Plus size={20}/></Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="PopoverContent addAttributeDefinitionPopup" sideOffset={5} align={"start"}>
                        {
                            customFilterCandidates?.map((attributeDefinition, index) => (
                                <button
                                    key={index}
                                    onClick={() => addFilter(attributeDefinition?.id || -1)}
                                >
                                    {attributeDefinition?.name || "Unnamed"}
                                </button>
                            )
                        )}
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            <button className={"export"} onClick={exportShotlist}>download shotlist<Download size={16} strokeWidth={3}/></button>
        </div>
    )
}