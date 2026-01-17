import {ChevronDown, Download, File, List, ListOrdered, Plus, Trash, Type, X} from "lucide-react"
import React, {Fragment, useEffect, useRef, useState} from "react"
import gql from "graphql-tag"
import {pdf, PDFViewer} from "@react-pdf/renderer"
import PDFExport from "@/components/dialogs/shotlistOptionsDialog/exportTab/PDFExport"
import {wuGeneral, wuTime} from "@yanikkendler/web-utils"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {
    Query,
    SceneDto, SceneMultiSelectAttributeDto, SceneSelectAttributeOptionDefinition, SceneSingleSelectAttributeDto,
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
    AnyShotAttributeDefinition, SceneSingleOrMultiSelectAttributeDefinition,
    SelectOption, ShotSingleOrMultiSelectAttribute, ShotSingleOrMultiSelectAttributeDefinition
} from "@/util/Types"
import Utils from "@/util/Utils"
import Config from "@/util/Config"
import MultiSelect from "@/components/inputs/multiSelect/multiSelect"
import {
    SceneAttributeDefinitionParser,
    SceneAttributeParser,
    ShotAttributeDefinitionParser,
    ShotAttributeParser
} from "@/util/AttributeParser"
//@ts-ignore
import {downloadCSV} from "@/downloadCSV"
import {Dialog, Popover} from "radix-ui"
import {MultiValue} from "react-select"
import HelpLink from "@/components/helpLink/helpLink"
import Skeleton from "react-loading-skeleton"
import ExportFilter from "@/components/dialogs/shotlistOptionsDialog/exportTab/exportFilter"
import Separator from "@/components/separator/separator"
import DotLoader from "@/components/DotLoader"

type SelectedFileTypes = "PDF" | "CSV-small" | "CSV-full"

interface ExportSettingsLocalStorage {
    selectedFileType?: SelectedFileTypes
    selectedScenes?: MultiValue<SelectOption>
    customShotFilters?: [number, MultiValue<SelectOption>][]
    customSceneFilters?: [number, MultiValue<SelectOption>][]
}

export default function ExportTab(
    {
        shotlist,
        shotAttributeDefinitions,
        sceneAttributeDefinitions
    }:
    {
        shotlist: ShotlistDto | null
        shotAttributeDefinitions: AnyShotAttributeDefinition[] | null
        sceneAttributeDefinitions: AnySceneAttributeDefinition[] | null
    }
) {
    const [sceneOptions, setSceneOptions] = useState<SelectOption[]>([{value: "this is bad", label: "1"}])

    const [selectedFileType, setSelectedFileType] = useState<SelectedFileTypes>("PDF")
    const [selectedScenes, setSelectedScenes] = useState<MultiValue<SelectOption>>([])
    const [customSceneFilters, setCustomSceneFilters] = useState<Map<number, MultiValue<SelectOption>>>(new Map())
    const [customShotFilters, setCustomShotFilters] = useState<Map<number, MultiValue<SelectOption>>>(new Map())

    const [shotlistPreviewCache, setShotlistPreviewCache] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const client = useApolloClient()

    const [exportRunning, setExportRunning] = useState(false)

    //load settings from local storage
    useEffect(() => {
        if(!shotlist || !shotlist.id) return

        loadSettingsFromLocalStorage(shotlist.id)
        extractSceneOptions()

        loadData().then(data => {
            if(!data) return

            setShotlistPreviewCache(data)
        })
    }, [shotlist])

    //save settings to local storage
    useEffect(() => {
        if(!shotlist || !shotlist.id) return

        const settingsObject: ExportSettingsLocalStorage = {
            selectedFileType: selectedFileType,
            selectedScenes: selectedScenes,
            customShotFilters: Array.from(customShotFilters),
            customSceneFilters: Array.from(customSceneFilters)
        }
        const settingsString = JSON.stringify(settingsObject)
        localStorage.setItem(Config.localStorageKey.exportSettings(shotlist.id), settingsString)
    }, [selectedFileType, selectedScenes, customShotFilters, customSceneFilters]);

    const loadSettingsFromLocalStorage = (shotlistId: string) => {
        const settingsString = localStorage.getItem(Config.localStorageKey.exportSettings(shotlistId))
        if (!settingsString) return

        const settingsObject = JSON.parse(settingsString) as ExportSettingsLocalStorage

        if(settingsObject.selectedFileType)
            setSelectedFileType(settingsObject.selectedFileType)
        if(settingsObject.selectedScenes && settingsObject.selectedScenes.length > 0)
            setSelectedScenes(settingsObject.selectedScenes)
        if(settingsObject.customShotFilters && settingsObject.customShotFilters.length > 0)
            setCustomShotFilters(new Map(settingsObject.customShotFilters))
        if(settingsObject.customSceneFilters && settingsObject.customSceneFilters.length > 0)
            setCustomSceneFilters(new Map(settingsObject.customSceneFilters))
    }

    const extractSceneOptions = () => {
        let newSceneOptions: SelectOption[] = [];
        for (let i = 0; i < (shotlist?.sceneCount || 0); i++) {
            newSceneOptions.push({value: i.toString(), label: `${(i + 1).toString()}`});
        }
        setSceneOptions(newSceneOptions)
    }

    const loadFilteredData = async () => {
        const queryResult = await loadData()

        if(!queryResult) return null;

        return filterData(queryResult)
    }

    async function loadData() {
        if(!shotlist) return null;

        const result = await client.query({
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



        return result
    }

    const filterData = (result: ApolloQueryResult<Query>): ShotlistDto => {
        let filteredScenes= result.data.shotlist?.scenes as SceneDto[] || []

        //scene number filter
        if(selectedScenes.length > 0) {
            const selectedScenesArray = Array.from(selectedScenes.entries()).map(s => s[1].value)

            filteredScenes = (result.data.shotlist?.scenes as SceneDto[] || [])
                .filter((scene) => selectedScenesArray.includes(String(scene.position)))
        }

        //custom scene attribute filters
        filteredScenes = filteredScenes.filter((scene) => {
            const matchesFilters = (scene.attributes as AnySceneAttribute[]).every(attribute => {
                if(!customSceneFilters.has(attribute.definition?.id)) return true //no filter was defined for this attribute

                const filter = customSceneFilters
                    .get(attribute.definition?.id)
                    ?.map(f => Number(f.value))

                if(!filter || filter.length == 0) return true //a filter was defined but no options were selected

                switch (attribute.type){
                    case "SceneSingleSelectAttributeDTO":
                        const singleValueId = (attribute as SceneSingleSelectAttributeDto).singleSelectValue?.id
                        if(filter.includes(singleValueId)) {
                            return true
                        }
                        break
                    case "SceneMultiSelectAttributeDTO":
                        const multiValue = (attribute as SceneMultiSelectAttributeDto).multiSelectValue
                        if(multiValue?.some(value =>
                            filter.includes(value?.id))
                        ) {
                            return true
                        }
                        break
                }

                return false //filters were found but not passed
            })

            return matchesFilters
        })

        //custom shot attribute filters
        filteredScenes.forEach(scene => {
            if(!scene.shots || scene.shots.length == 0) return

            const filteredShots: ShotDto[] = []

            /**
             * For every shot - check if all the attributes match the filters
             * if any attribute does not match, the whole shot is not included
             *
             * Every attribute can only have one filter associated with it so iterating over all the attributes and
             * then checking if a filter exists for each attribute covers all cases
             *
             * The shots of the scene are then replaced with only those that passed the filter (filteredShots)
             */
            scene.shots.forEach(shot => {
                if(!shot) return

                const matchesFilters = (shot.attributes as AnyShotAttribute[]).every(attribute => {
                    if(!customShotFilters.has(attribute.definition?.id)) return true //no filter was defined for this attribute

                    const filter = customShotFilters.get(attribute.definition?.id)?.map(f => Number(f.value))
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

        //remove scenes where not shots passed the filters
        filteredScenes = filteredScenes.filter(scene => {
            return scene.shots && scene.shots.length > 0
        })

        return {...result.data.shotlist, scenes: filteredScenes} as ShotlistDto;
    }

    async function exportShotlist() {
        const data: ShotlistDto | null = await loadFilteredData()

        if (!data) {
            //TODO notification
            console.error("No data found for export");
            return;
        }

        setExportRunning(true)

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
        
        setTimeout(() => {
            setExportRunning(false)
        },2000)
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
        return `shotly_${shotlist?.name?.replace(/\s/g, "-") || "unnamed-shotlist"}_${wuTime.toDateTimeString(Date.now(), {timeSeparator: "-", dateSeparator: "-", dateTimeSeparator: "_"})}`
    }

    const addShotFilter = (attributeDefinitionId: number) => {
        const newCustomFilters = new Map(customShotFilters)
        newCustomFilters.set(attributeDefinitionId, [])
        setCustomShotFilters(newCustomFilters)
    }

    const addSceneFilter = (attributeDefinitionId: number) => {
        const newCustomFilters = new Map(customSceneFilters)
        newCustomFilters.set(attributeDefinitionId, [])
        setCustomSceneFilters(newCustomFilters)
    }

    const setShotFilterValue = (attributeDefinitionId: number, value: MultiValue<SelectOption>) => {
        const newCustomFilters = new Map(customShotFilters)
        newCustomFilters.set(attributeDefinitionId, value)
        setCustomShotFilters(newCustomFilters)
    }

    const setSceneFilterValue = (attributeDefinitionId: number, value: MultiValue<SelectOption>) => {
        const newCustomFilters = new Map(customSceneFilters)
        newCustomFilters.set(attributeDefinitionId, value)
        setCustomSceneFilters(newCustomFilters)
    }

    const removeShotFilter = (attributeDefinitionId: number) => {
        const newCustomFilters = new Map(customShotFilters)
        newCustomFilters.delete(attributeDefinitionId)
        setCustomShotFilters(newCustomFilters)
    }

    const removeSceneFilter = (attributeDefinitionId: number) => {
        const newCustomFilters = new Map(customSceneFilters)
        newCustomFilters.delete(attributeDefinitionId)
        setCustomSceneFilters(newCustomFilters)
    }

    if(!shotlist) return <>
        <h2>Configure the export</h2>
        <Skeleton height={"2rem"} count={2} style={{marginTop: ".5rem"}}/>
        <Skeleton height={"2rem"} width={"15ch"} style={{marginTop: "2rem"}}/>
    </>

    const customSceneFilterCandidates = sceneAttributeDefinitions
        ?.filter(attributeDefinition => {
            if(
                customSceneFilters.has(attributeDefinition?.id) ||
                (attributeDefinition as AnySceneAttributeDefinition).type === "SceneTextAttributeDefinitionDTO"
            ) return false
            return true
        })

    const customShotFilterCandidates = shotAttributeDefinitions
        ?.filter(attributeDefinition => {
            if(
                customShotFilters.has(attributeDefinition?.id) ||
                (attributeDefinition as AnyShotAttributeDefinition).type === "ShotTextAttributeDefinitionDTO"
            ) return false
            return true
        })

    return (
        <div className={"shotlistOptionsDialogExportTab"}>
            <h2>Configure the export</h2>

            <div className="scroll">
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
                            fontSize={".9rem"}
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
                </div>

                {customSceneFilters.size > 0 && <Separator text={"Scene attributes"}/>}

                <div className="filters">
                    {Array.from(customSceneFilters).map((filter, index) => {
                        const definition = sceneAttributeDefinitions?.find(def => def?.id === filter[0]) as SceneSingleOrMultiSelectAttributeDefinition

                        if(!definition) return null

                        const Icon = SceneAttributeDefinitionParser.toIcon(definition)
                        const options = (definition.options as SceneSelectAttributeOptionDefinition[])
                            ?.map(option =>
                                ({
                                    value: option.id.toString(),
                                    label: option.name || "Unnamed",
                                })
                            ) || []

                        return (<Fragment key={definition.id}>
                            <ExportFilter
                                Icon={Icon}
                                name={definition.name || "Unnamed"}
                                isMulti={SceneAttributeDefinitionParser.isMulti(definition)}
                                options={options}
                                value={filter[1]}
                                onChange={newValue => {
                                    setSceneFilterValue(definition.id, newValue)
                                }}
                                onRemove={() => removeSceneFilter(definition.id)}
                            />
                            {customSceneFilters.size > index+1 && <p className="combinationInfo">and</p>}
                        </Fragment>)
                    })}
                </div>

                {customShotFilters.size > 0 && <Separator text={"Shot attributes"}/>}

                <div className="filters">
                    {Array.from(customShotFilters).map((filter, index) => {
                        const definition = shotAttributeDefinitions?.find(def => def?.id === filter[0]) as ShotSingleOrMultiSelectAttributeDefinition

                        if(!definition) return null

                        const Icon = ShotAttributeDefinitionParser.toIcon(definition)
                        const options = (definition.options as ShotSelectAttributeOptionDefinition[])
                            ?.map(option =>
                                ({value: option.id.toString(), label: option.name || "Unnamed"})
                            ) || []

                        return (<Fragment key={definition.id}>
                            <ExportFilter
                                Icon={Icon}
                                name={definition.name || "Unnamed"}
                                isMulti={ShotAttributeDefinitionParser.isMulti(definition)}
                                options={options}
                                value={filter[1]}
                                onChange={newValue => {
                                    setShotFilterValue(definition.id, newValue)
                                }}
                                onRemove={() => removeShotFilter(definition.id)}
                            />
                            {customShotFilters.size > index+1 && <p className="combinationInfo">and</p>}
                        </Fragment>)
                    })}
                </div>

                <Popover.Root>
                    <Popover.Trigger className={"addFilter"}>
                        Add filter <Plus size={20}/>
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content className="PopoverContent addFilterPopup" sideOffset={5} align={"start"}>
                                <h3>Scene</h3>
                                {
                                    !customSceneFilterCandidates || customSceneFilterCandidates?.length <= 0 ?
                                        <p className="empty">None left</p> :
                                    customSceneFilterCandidates?.map((attributeDefinition, index) => (
                                        <Popover.Close asChild key={index}>
                                            <button
                                                onClick={() => addSceneFilter(attributeDefinition?.id || -1)}
                                            >
                                                {attributeDefinition?.name || "Unnamed"}
                                            </button>
                                        </Popover.Close>
                                    ))
                                }
                                <h3>Shot</h3>
                                {
                                    !customShotFilterCandidates || customShotFilterCandidates?.length <= 0 ?
                                        <p className="empty">None left</p> :
                                    customShotFilterCandidates.map((attributeDefinition, index) => (
                                        <Popover.Close asChild key={index}>
                                            <button
                                                onClick={() => addShotFilter(attributeDefinition?.id || -1)}
                                            >
                                                {attributeDefinition?.name || "Unnamed"}
                                            </button>
                                        </Popover.Close>
                                    ))
                                }
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            </div>

            <div className="bottom">
                <button
                    className={"export"}
                    onClick={exportShotlist}
                    disabled={exportRunning}
                >
                    {
                        exportRunning ?
                        <span>{"exporting"}<DotLoader/></span> :
                        <>{"Download shotlist"}<Download size={16} strokeWidth={3}/></>
                    }
                </button>
                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <button className="preview">
                            Preview
                        </button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className={"dialogOverlay"}/>
                        <Dialog.Content className="dialogContent pdfPreviewDialogContent">
                            <Dialog.Title>PDF preview <span>(the final export will be: {selectedFileType})</span></Dialog.Title>
                            <PDFViewer showToolbar={false}>
                                <PDFExport data={shotlistPreviewCache.data.shotlist as ShotlistDto}/>
                            </PDFViewer>
                            <Dialog.Close asChild>
                                <button
                                    className={"export"}
                                    onClick={exportShotlist}
                                >
                                    Download shotlist<Download size={16} strokeWidth={3}/>
                                </button>
                            </Dialog.Close>
                            <p className="small">If a collaborator has edited the shotlist, the preview might not be fully up to date, but the final export will be.</p>

                            <Dialog.Close asChild>
                                <button className={"closeButton"}>
                                    <X size={18}/>
                                </button>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
                <HelpLink link="https://docs.shotly.at/shotlist/export"/>
            </div>
        </div>
    )
}