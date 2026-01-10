import {ChevronDown, Download, File, List, ListOrdered, Plus, Trash, Type, X} from "lucide-react"
import React, {Fragment, useEffect, useRef, useState} from "react"
import gql from "graphql-tag"
import {pdf} from "@react-pdf/renderer"
import PDFExport from "@/components/PDFExport"
import {wuTime} from "@yanikkendler/web-utils"
import {useApolloClient} from "@apollo/client"
import {
    SceneAttributeType,
    SceneDto,
    ShotDto,
    ShotlistDto, ShotMultiSelectAttributeDto,
    ShotSelectAttributeOptionDefinition, ShotSingleSelectAttributeDto
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
import Config from "@/util/Config"
import MultiSelect from "@/components/inputs/multiSelect/multiSelect"
import {SceneAttributeParser, ShotAttributeDefinitionParser, ShotAttributeParser} from "@/util/AttributeParser"
//@ts-ignore
import Loader from "@/components/feedback/loader/loader"
import {downloadCSV} from "@/downloadCSV"
import {Popover, Separator} from "radix-ui"
import {MultiValue} from "react-select"
import HelpLink from "@/components/helpLink/helpLink"

type SelectedFileTypes = "PDF" | "CSV-small" | "CSV-full"

interface ExportSettingsLocalStorage {
    selectedFileType?: SelectedFileTypes
    selectedScenes?: MultiValue<SelectOption>
    customFilters?: [number, MultiValue<SelectOption>][]
}

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
    const [sceneOptions, setSceneOptions] = useState<SelectOption[]>([{value: "this is bad", label: "1"}])

    const [selectedFileType, setSelectedFileType] = useState<SelectedFileTypes>("PDF")
    const [selectedScenes, setSelectedScenes] = useState<MultiValue<SelectOption>>([])
    const [customFilters, setCustomFilters] = useState<Map<number, MultiValue<SelectOption>>>(new Map())

    const client = useApolloClient()

    //retrieve settings from local storage
    useEffect(() => {
        const settingsString = localStorage.getItem(Config.localStorageKey.exportSettings)
        if (!settingsString) return;

        const settingsObject = JSON.parse(settingsString) as ExportSettingsLocalStorage

        console.log(settingsObject)

        if(settingsObject.selectedFileType)
            setSelectedFileType(settingsObject.selectedFileType)
        if(settingsObject.selectedScenes && settingsObject.selectedScenes.length > 0)
            setSelectedScenes(settingsObject.selectedScenes)
        if(settingsObject.customFilters && settingsObject.customFilters.length > 0) {
            setCustomFilters(new Map(settingsObject.customFilters))
        }

    }, [])

    //save settings to local storrage
    useEffect(() => {
        const settingsObject: ExportSettingsLocalStorage = {
            selectedFileType: selectedFileType,
            selectedScenes: selectedScenes,
            customFilters: Array.from(customFilters)
        }
        const settingsString = JSON.stringify(settingsObject)
        localStorage.setItem(Config.localStorageKey.exportSettings, settingsString)
    }, [selectedFileType, selectedScenes, customFilters]);

    //extract scenes as SelectOptions from shotlist
    useEffect(() => {
        if (!shotlist) return;

        let newSceneOptions: SelectOption[] = [];
        for (let i = 0; i < (shotlist?.sceneCount || 0); i++) {
            newSceneOptions.push({value: i.toString(), label: `${(i + 1).toString()}`});
        }
        setSceneOptions(newSceneOptions)
    }, [shotlist]);

    async function getFilteredData() {
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
                                    type

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
                                        type

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

        //TODO error handling and notification

        let filteredScenes= data.shotlist.scenes as SceneDto[]

        //scene number filter
        if(selectedScenes.length > 0) {
            const selectedScenesArray = Array.from(selectedScenes.entries()).map(s => s[1].value)

            filteredScenes = (data.shotlist.scenes as SceneDto[])
                .filter((scene) => selectedScenesArray.includes(String(scene.position)))
        }

        //custom attribute filters
        filteredScenes.forEach(scene => {
            if(!scene.shots || scene.shots.length == 0) return

            const filteredShots: ShotDto[] = []

            /**
             * For every shot - check if all the attributes match the filters
             * if any attribute does not match, the whole shot is not included
             *
             * Every attribute can only have one filter associated with it so iterating over all the attributes
             * and then checking if a filter exists for each attribute covers all cases
             *
             * The shots of the scene are then replaced with only those that passed the filter (filteredShots)
             */
            scene.shots.forEach(shot => {
                if(!shot) return

                const matchesFilters = (shot.attributes as AnyShotAttribute[]).every(attribute => {
                    if(!customFilters.has(attribute.definition?.id)) return true //no filter was defined for this attribute

                    const filter = customFilters.get(attribute.definition?.id)?.map(f => Number(f.value))
                    if(!filter || filter.length == 0) return true //a filter was defined but no options were selected

                    switch (attribute.type){
                        case "ShotSingleSelectAttributeDTO":
                            const singleValueId = (attribute as ShotSingleSelectAttributeDto).singleSelectValue?.id
                            if(filter.includes(singleValueId)) {
                                return true
                            }
                            break
                        case "ShotMultiSelectAttributeDTO":
                            const multiValue = (attribute as ShotMultiSelectAttributeDto).multiSelectValue
                            if(multiValue?.some(value =>
                                filter.includes(value?.id))
                            ) {
                                return true
                            }
                            break
                    }

                    return false //filters were found but not passed
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
        const data: ShotlistDto | null = await getFilteredData()

        if (!data) {
            //TODO notification
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
        //CSV header
        let header: string[] = ["Shot"]; //this semicolon is actually needed :3 (typescript stupid)
        (data.shotAttributeDefinitions as AnyShotAttributeDefinition[]).forEach(attr => {
            header.push(attr.name || "Unnamed")
        }); //this one too

        //CSV body
        let smallData: string[][] = [];
        (data.scenes as SceneDto[]).forEach((scene) => {
            (scene.shots as ShotDto[]).forEach(shot => {
                let row: string[] = [scene.position + 1 + Utils.numberToShotLetter(shot.position, scene.position)]; //mmh

                (shot.attributes as AnyShotAttribute[]).forEach(attribute => {
                    row.push(ShotAttributeParser.toValueString(attribute, false))
                })
                smallData.push(row)
            })
        })

        downloadCSV(smallData, header, ";", generateFileName())
    }

    const exportCSVFull =(data: ShotlistDto) =>{
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
            let sceneRow: string[] = ["Scene " + (scene.position + 1)]; // :(
            (scene.attributes as AnySceneAttribute[]).forEach((attribute) => {
                sceneRow.push(SceneAttributeParser.toValueString(attribute, false))
            })
            fullData.push(sceneRow)
            fullData.push(shotHeader); //...

            (scene.shots as ShotDto[]).forEach(shot => {
                let row: string[] = [Utils.numberToShotLetter(shot.position, scene.position)]; //hrmpf

                (shot.attributes as AnyShotAttribute[]).forEach(attribute => {
                    row.push(ShotAttributeParser.toValueString(attribute, false))
                })
                fullData.push(row)
            })
        })

        downloadCSV(fullData, sceneHeader, ";", generateFileName())
    }

    const exportPDF = async (data: ShotlistDto) => {
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

    const setFilterValue = (attributeDefinitionId: number, value: MultiValue<SelectOption>) => {
        const newCustomFilters = new Map(customFilters)
        newCustomFilters.set(attributeDefinitionId, value)
        setCustomFilters(newCustomFilters)
    }

    const removeFilter = (attributeDefinitionId: number) => {
        const newCustomFilters = new Map(customFilters)
        newCustomFilters.delete(attributeDefinitionId)
        setCustomFilters(newCustomFilters)
    }

    //TODO check if this is correct or should be an error
    if(!shotlist) return <Loader text={"loading shotlist export"}/>

    const customFilterCandidates = shotAttributeDefinitions
        ?.filter(attributeDefinition => {
            if(
                customFilters.has(attributeDefinition?.id) ||
                (attributeDefinition as AnyShotAttributeDefinition).type === "ShotTextAttributeDefinitionDTO"
            ) return false
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
                        value={selectedFileType}
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
                        value={selectedScenes}
                        onChange={newValue => {
                            setSelectedScenes(newValue)
                        }}
                        sorted={true}
                        minWidth={"20rem"}
                    />
                </div>

                <Separator.Separator orientation="horizontal" className={"Separator"}/>


                {Array.from(customFilters).map((filter, index) => {
                    const definition = shotAttributeDefinitions?.find(def => def?.id === filter[0]) as ShotSingleOrMultiSelectAttributeDefinition
                    const Icon = ShotAttributeDefinitionParser.toIcon(definition)

                    return (<Fragment key={definition.id}>
                        <div className="filter">
                            <div className="left">
                                <Icon size={22}/>
                                <p>{definition.name || "Unnamed"}</p>
                            </div>

                            <p className="combinationInfo">is {(customFilters.get(definition.id)?.length || 0) > 1 && "one of"}</p>

                            <div className="right">
                                <MultiSelect
                                    name={definition.name || "Unnamed"}
                                    placeholder={"All " + (definition.name || "Unnamed") + "s"}
                                    value={filter[1]}
                                    options={
                                        (definition.options as ShotSelectAttributeOptionDefinition[])
                                            ?.map(option =>
                                                ({value: option.id.toString(), label: option.name || "Unnamed"})
                                            ) || []
                                    }
                                    onChange={newValue => {
                                        setFilterValue(definition.id, newValue)
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
                        {customFilters.size > index+1 && <p className="combinationInfo">and</p>}
                    </Fragment>)
                })}
            </div>

            {/*TODO show empty info instead of disabling*/}
            <Popover.Root>
                <Popover.Trigger className={"addFilter"} disabled={customFilterCandidates?.length == 0}>Add filter<Plus size={20}/></Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="PopoverContent addAttributeDefinitionPopup" sideOffset={5} align={"start"}>
                            {
                                customFilterCandidates?.map((attributeDefinition, index) => (
                                    <Popover.Close asChild key={index}>
                                        <button
                                            onClick={() => addFilter(attributeDefinition?.id || -1)}
                                        >
                                            {attributeDefinition?.name || "Unnamed"}
                                        </button>
                                    </Popover.Close>
                                ))
                            }
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            <button className={"export"} onClick={exportShotlist}>download shotlist<Download size={16} strokeWidth={3}/></button>

            <HelpLink link="https://docs.shotly.at/shotlist/export" floating/>
        </div>
    )
}