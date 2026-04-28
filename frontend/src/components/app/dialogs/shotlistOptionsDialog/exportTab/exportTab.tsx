import {
    Download,
    File,
    ListOrdered,
    Plus,
    SquareCheck,
    X,
    LucideWrapText,
    Repeat,
    Heading,
    Type,
    RotateCcw,
    Eye
} from "lucide-react"
import React, {Fragment, RefObject, useEffect, useRef, useState} from "react"
import gql from "graphql-tag"
import {wuTime} from "@yanikkendler/web-utils"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {
    Query,
    SceneDto, SceneMultiSelectAttributeDto, SceneSelectAttributeOptionDefinition, SceneSingleSelectAttributeDto,
    ShotDto,
    ShotlistDto, ShotMultiSelectAttributeDto,
    ShotSelectAttributeOptionDefinition, ShotSingleSelectAttributeDto
} from "../../../../../../lib/graphql/generated"
import "./exportTab.scss"
import SimpleSelect from "@/components/basic/simpleSelect/simpleSelect"
import {
    AnySceneAttribute,
    AnySceneAttributeDefinition,
    AnyShotAttribute,
    AnyShotAttributeDefinition, SceneSingleOrMultiSelectAttributeDefinition,
    SelectOption, ShotSingleOrMultiSelectAttributeDefinition
} from "@/utility/Types"
import Utils from "@/utility/Utils"
import Config from "@/Config"
import MultiSelect from "@/components/basic/multiSelect/multiSelect"
import {
    SceneAttributeDefinitionParser,
    ShotAttributeDefinitionParser,
} from "@/utility/AttributeParser"
import {Switch} from "radix-ui"
import {MultiValue} from "react-select"
import HelpLink from "@/components/app/helpLink/helpLink"
import Skeleton from "react-loading-skeleton"
import ExportFilter from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportFilter"
import Separator from "@/components/basic/separator/separator"
import DotLoader from "@/components/basic/DotLoader"
import {errorNotification, infoNotification, successNotification} from "@/service/NotificationService"
import {td} from "@/service/Analytics"
import TextField from "@/components/basic/textField/textField"
import Collapse from "@/components/basic/collapse/collapse"
import ExportPreview from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportPreview/exportPreview"
import {DialogRef} from "@/components/basic/dialog/dialog"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"
import usePdfExport, {PdfExportOptions} from "@/service/export/usePdfExport"
import useCsvExport from "@/service/export/useCsvExport"
import useXlsxExport from "@/service/export/useXlsxExport"
import AddExportFilterPopover from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/addExportFilterPopover"
import PdfSettings from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/pdfSettings"

type SelectedFileTypes = "PDF" | "CSV-small" | "CSV-full" | "XLSX"

interface ExportSettingsLocalStorage {
    selectedFileType?: SelectedFileTypes
    pdfExportOptions?: PdfExportOptions
    selectedScenes?: MultiValue<SelectOption>
    customShotFilters?: [number, MultiValue<SelectOption>][]
    customSceneFilters?: [number, MultiValue<SelectOption>][]
}

export default function ExportTab(
    {
        shotlist,
        shotAttributeDefinitions,
        sceneAttributeDefinitions,
        shotlistOptionsDialogRef
    }:
    {
        shotlist: ShotlistDto | null
        shotAttributeDefinitions: AnyShotAttributeDefinition[] | null
        sceneAttributeDefinitions: AnySceneAttributeDefinition[] | null
        shotlistOptionsDialogRef: RefObject<DialogRef | null>
    }
) {
    const {confirm, ConfirmDialog} = useConfirmDialog()
    const client = useApolloClient()

    const [scenesAsOptions, setScenesAsOptions] = useState<SelectOption[]>([{label: "this is bad", value: "-1"}])

    const [selectedFileType, setSelectedFileType] = useState<SelectedFileTypes>("PDF")
    const [pdfExportOptions, setPdfExportOptions] = useState<PdfExportOptions>({
        showCheckboxes: false,
        avoidOrphans: true,
        repeatSceneHeading: false,
        repeatAttributeDefinitions: false,
        headerText: ""
    })
    const [selectedScenes, setSelectedScenes] = useState<MultiValue<SelectOption>>([])
    const [customSceneFilters, setCustomSceneFilters] = useState<Map<number, MultiValue<SelectOption>>>(new Map())
    const [customShotFilters, setCustomShotFilters] = useState<Map<number, MultiValue<SelectOption>>>(new Map())

    const [shotlistPreviewCache, setShotlistPreviewCache] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [exportRunning, setExportRunning] = useState(false)

    //load settings from local storage
    useEffect(() => {
        if(!shotlist || !shotlist.id) return

        loadDataForExport().then(data => {
            if(!data) return

            setShotlistPreviewCache(data)
        })

        if(!Utils.getUserSettingsFromLocalStorage().saveExportSettingsInLocalstorage) return

        loadSettingsFromLocalStorage(shotlist.id)

        setScenesAsOptions(Utils.scenesToSelectOptions(shotlist?.scenes))
    }, [shotlist])

    //save settings to local storage
    useEffect(() => {
        if(!shotlist || !shotlist.id) return

        const settingsObject: ExportSettingsLocalStorage = {
            selectedFileType: selectedFileType,
            pdfExportOptions: pdfExportOptions,
            selectedScenes: selectedScenes,
            customShotFilters: Array.from(customShotFilters),
            customSceneFilters: Array.from(customSceneFilters)
        }
        const settingsString = JSON.stringify(settingsObject)
        localStorage.setItem(Config.localStorageKey.exportSettings(shotlist.id), settingsString)
    }, [selectedFileType, pdfExportOptions, selectedScenes, customShotFilters, customSceneFilters]);

    const generateFileName = () => {
        return `shotly_${shotlist?.name?.replace(/\s/g, "-") || "unnamed-shotlist"}_${wuTime.toDateTimeString(Date.now(), {timeSeparator: "-", dateSeparator: "-", dateTimeSeparator: "_"})}`
    }

    const {exportPdf} = usePdfExport({generateFileName, pdfExportOptions})
    const {exportCsvSmall, exportCsvFull} = useCsvExport({generateFileName})
    const {exportXLSX} = useXlsxExport({generateFileName})

    const loadSettingsFromLocalStorage = (shotlistId: string) => {
        const settingsString = localStorage.getItem(Config.localStorageKey.exportSettings(shotlistId))
        if (!settingsString) return

        const settingsObject = JSON.parse(settingsString) as ExportSettingsLocalStorage

        if(settingsObject.selectedFileType)
            setSelectedFileType(settingsObject.selectedFileType)
        if(settingsObject.pdfExportOptions)
            setPdfExportOptions(settingsObject.pdfExportOptions)
        if(settingsObject.selectedScenes && settingsObject.selectedScenes.length > 0) {
            //only load scenes from LS that actually exists in the scenesAsOptions
            const filtered = settingsObject.selectedScenes.filter(selected => scenesAsOptions.some(option => option.value == selected.value))
            setSelectedScenes(filtered)
        }
        if(settingsObject.customSceneFilters && settingsObject.customSceneFilters.length > 0) {
            //only load filters that reference an existing attributeDefinition id
            let filtered = settingsObject.customSceneFilters.filter(f => sceneAttributeDefinitions?.some(d => d.id == f[0]))
            //remove selected filter values that reference a non-existent select option
            filtered = filtered.map(
                f => [
                    f[0],
                    f[1].filter(v => {
                        const def = sceneAttributeDefinitions?.find(s => s.id == f[0]) as SceneSingleOrMultiSelectAttributeDefinition
                        return def.options?.some(o => o?.id == v.value)
                    })
                ]
            )
            setCustomSceneFilters(new Map(filtered))
        }
        if(settingsObject.customShotFilters && settingsObject.customShotFilters.length > 0) {
            //only load filters that reference an existing attributeDefinition id
            let filtered = settingsObject.customShotFilters.filter(f => shotAttributeDefinitions?.some(d => d.id == f[0]))
            //remove selected filter values that reference a non-existent select option
            filtered = filtered.map(
                f => [
                    f[0],
                    f[1].filter(v => {
                        const def = shotAttributeDefinitions?.find(s => s.id == f[0]) as ShotSingleOrMultiSelectAttributeDefinition
                        return def.options?.some(o => o?.id == v.value)
                    })
                ]
            )
            setCustomShotFilters(new Map(filtered))
        }
    }

    const loadFilteredData = async () => {
        const queryResult = await loadDataForExport()

        if(!queryResult) return null;

        return filterData(queryResult)
    }

    async function loadDataForExport() {
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

        if(result.errors){
            console.error(result.errors)
            errorNotification({
                title: "Failed to load shotlist data",
                tryAgainLater: true
            })
        }

        return result
    }

    const resetValues = async () => {
        if(!await confirm({
            title: "Reset Filters?",
            message: `This will reset "format", "scenes", any additional settings and remove all custom filters.`,
            buttons: {
                confirm: {
                    className: "bad",
                }
            }
        })) return

        setSelectedFileType("PDF")
        setPdfExportOptions({
            showCheckboxes: false,
            avoidOrphans: true,
            repeatSceneHeading: false,
            repeatAttributeDefinitions: false,
            headerText: ""
        })
        setSelectedScenes([])
        setCustomSceneFilters(new Map())
        setCustomShotFilters(new Map())

        successNotification({
            title: "All filters were reset to defaults"
        })
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
            return
        }

        td.signal("Shotlist.Options.Export.Exported", {
            fileType: selectedFileType,
            pdfExportOptions: pdfExportOptions,
            filterCount: customSceneFilters.size + customShotFilters.size,
            selectedScenes: setSelectedScenes.length
        })

        setExportRunning(true)

        switch (selectedFileType) {
            case "CSV-small":
                exportCsvSmall(data)
                break
            case "CSV-full":
                exportCsvFull(data)
                break
            case "PDF":
                exportPdf(data)
                break
            case "XLSX":
                exportXLSX(data)
                break
        }

        infoNotification({
            title: "Generating your export!",
        })
        
        setTimeout(() => {
            setExportRunning(false)
        },2000)
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

    if(!shotlist) return <div className={"shotlistOptionsDialogExportTab shotlistOptionsDialogPage"}>
        <div className="top">
            <h2>Configure the export</h2>
            <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                <X size={18}/>
            </button>
        </div>
        <Skeleton height={"2rem"} count={2} style={{marginTop: ".5rem"}}/>
        <Skeleton height={"2rem"} width={"15ch"} style={{marginTop: "2rem"}}/>
    </div>

    return (
        <div className={"shotlistOptionsDialogExportTab shotlistOptionsDialogPage"}>
            <div className="top">
                <h2>Configure the export</h2>
                <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>

            <div className="filters">
                <div className="filter">
                    <div className="left">
                        <File size={22}/>
                        <p>Format</p>
                    </div>

                    <SimpleSelect
                        name="File Type"
                        onChange={newValue => setSelectedFileType(newValue as SelectedFileTypes)}
                        options={[
                            {value: "PDF", label: "PDF"},
                            {value: "XLSX", label: "XLSX"},
                            {value: "CSV-full", label: "CSV (full)"},
                            {value: "CSV-small", label: "CSV (shots only)"},
                        ]}
                        value={selectedFileType}
                        fontSize={".9rem"}
                    />
                </div>
                {
                    selectedFileType == "PDF" &&
                    <>
                        <PdfSettings
                            pdfExportOptions={pdfExportOptions}
                            setPdfExportOptions={setPdfExportOptions}
                        />
                        <Separator/>
                    </>
                }
                <div className="filter">
                    <div className="left">
                        <ListOrdered size={22}/>
                        <p>Scenes</p>
                    </div>

                    <MultiSelect
                        name={"Scenes"}
                        placeholder={"All Scenes"}
                        options={scenesAsOptions}
                        value={selectedScenes}
                        onChange={newValue => {
                            setSelectedScenes(newValue)
                        }}
                        sorted={true}
                        minWidth={"20rem"}
                    />
                </div>
            </div>

            {/* SCENE */}

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

            {/* SHOT */}

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

            <AddExportFilterPopover
                sceneAttributeDefinitions={sceneAttributeDefinitions}
                shotAttributeDefinitions={shotAttributeDefinitions}
                customSceneFilters={customSceneFilters}
                customShotFilters={customShotFilters}
                addSceneFilter={addSceneFilter}
                addShotFilter={addShotFilter}
            />

            <span className="scrollSpacer" aria-hidden></span>

            <div className="bottom">
                <button
                    className={"export"}
                    onClick={exportShotlist}
                    disabled={exportRunning}
                >
                    {
                        exportRunning ?
                        <span>{"Exporting"}<DotLoader/></span> :
                        <><span>Download shotlist</span><Download size={16} strokeWidth={3}/></>
                    }
                </button>
                <ExportPreview data={filterData(shotlistPreviewCache)} exportShotlist={exportShotlist}/>
                <button className="secondary" onClick={resetValues}>
                    <span>Reset</span> <RotateCcw size={16} strokeWidth={2.5}/>
                </button>

                <HelpLink link="https://docs.shotly.at/shotlist/export" name={"Export"}/>
            </div>

            {ConfirmDialog}
        </div>
    )
}