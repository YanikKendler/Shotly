import {
    Download,
    File,
    ListOrdered,
    X,
    RotateCcw,
    Rows4, Table,
} from "lucide-react"
import React, {Fragment, RefObject, useCallback, useContext, useEffect, useRef, useState} from "react"
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
    SceneAttributeDefinitionParser, SceneAttributeParser,
    ShotAttributeDefinitionParser, ShotAttributeParser,
} from "@/utility/AttributeParser"
import {MultiValue} from "react-select"
import HelpLink from "@/components/app/helpLink/helpLink"
import Skeleton from "react-loading-skeleton"
import ExportFilter from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportFilter/exportFilter"
import Separator from "@/components/basic/separator/separator"
import DotLoader from "@/components/basic/DotLoader"
import {errorNotification, infoNotification, successNotification} from "@/service/NotificationService"
import Analytics from "@/service/Analytics"
import ExportPreview from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportPreview/exportPreview"
import {DialogRef} from "@/components/basic/dialog/dialog"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"
import usePdfExport, {PdfExportOptions} from "@/service/export/usePdfExport"
import useCsvExport from "@/service/export/useCsvExport"
import useXlsxExport from "@/service/export/useXlsxExport"
import AddExportFilterPopover from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/addPopover/addExportFilterPopover"
import PdfSettings from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/pdfSettings"
import {Switch} from "radix-ui"
import {wuGeneral} from "@yanikkendler/web-utils/dist"
import AddExportSortPopover
    from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/addPopover/addExportSortPopover"
import ExportSort from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportSort/exportSort"
import Sortable from "sortablejs"
import useJsonExport from "@/service/export/useJsonExport"
import SimpleCollapse, {SimpleCollapseRef} from "@/components/basic/simpleCollapse/simpleCollapse"
import {AppContext} from "@/context/AppContext"

type ExportFileTypes = "PDF" | "CSV" | "XLSX" | "JSON"

export type ExportFilterMethod = "exclude" | "include" | "includeOnly"

export interface ExportFilterSetting {
    definitionId: number
    method: ExportFilterMethod
    value: MultiValue<SelectOption>
}

export type ExportSortOrder = "descending" | "ascending"

export interface ExportSortSetting {
    definitionId: number
    order: ExportSortOrder
}

interface ExportSettingsLocalStorage {
    selectedFileType?: ExportFileTypes
    hideSceneHeadings?: boolean
    pdfExportOptions?: PdfExportOptions
    selectedScenes?: MultiValue<SelectOption>
    selectedSceneAttributeDefs?: MultiValue<SelectOption>
    selectedShotAttributeDefs?: MultiValue<SelectOption>
    customSceneFilters?: ExportFilterSetting[]
    customShotFilters?: ExportFilterSetting[]
    customSceneSorts?: ExportSortSetting[]
    customShotSorts?: ExportSortSetting[]
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
    const appContext = useContext(AppContext)

    const [scenesAsOptions, setScenesAsOptions] = useState<SelectOption[]>([{label: "this is bad", value: "-1"}])
    const [sceneAttributeDefsAsOptions, setSceneAttributeDefsAsOptions] = useState<SelectOption[]>([{label: "this is bad", value: "-1"}])
    const [shotAttributeDefsAsOptions, setShotAttributeDefsAsOptions] = useState<SelectOption[]>([{label: "this is bad", value: "-1"}])

    const [selectedFileType, setSelectedFileType] = useState<ExportFileTypes>("PDF")
    const [hideSceneHeadings, setHideSceneHeadings] = useState(false)
    const [pdfExportOptions, setPdfExportOptions] = useState<PdfExportOptions>({
        showCheckboxes: false,
        avoidOrphans: true,
        repeatSceneHeading: false,
        repeatAttributeDefinitions: false,
        headerText: ""
    })
    const [selectedScenes, setSelectedScenes] = useState<MultiValue<SelectOption>>([])
    const [selectedSceneAttributeDefs, setSelectedSceneAttributeDefs] = useState<MultiValue<SelectOption>>([])
    const [selectedShotAttributeDefs, setSelectedShotAttributeDefs] = useState<MultiValue<SelectOption>>([])
    const [customSceneFilters, setCustomSceneFilters] = useState<ExportFilterSetting[]>([])
    const [customShotFilters, setCustomShotFilters] = useState<ExportFilterSetting[]>([])
    const [customSceneSorts, setCustomSceneSorts] = useState<ExportSortSetting[]>([])
    const [customShotSorts, setCustomShotSorts] = useState<ExportSortSetting[]>([])

    const sceneSortContainerRef = useRef<Sortable>(null);
    const shotSortContainerRef = useRef<Sortable>(null);

    const visibleAttributesRef = useRef<SimpleCollapseRef>(null);

    const [shotlistPreviewCache, setShotlistPreviewCache] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    const [previewData, setPreviewData] = useState<ShotlistDto | null>(null)

    const scenePositionLUT = useRef<Map<string, number>>(new Map())

    const [exportRunning, setExportRunning] = useState(false)

    //load settings from local storage
    useEffect(() => {
        if(!shotlist || !shotlist.id) return

        loadData() //to populate the preview cache

        if(!Utils.getUserSettingsFromLocalStorage().saveExportSettingsInLocalstorage) return

        loadSettingsFromLocalStorage(shotlist.id)

        setScenesAsOptions(Utils.scenesToSelectOptions(shotlist?.scenes))
    }, [shotlist, shotAttributeDefinitions, sceneAttributeDefinitions])

    useEffect(() => {
        setSceneAttributeDefsAsOptions(!sceneAttributeDefinitions ? [] : sceneAttributeDefinitions.map(d => ({
            label: d.name || "Unnamed",
            value: String(d.id)
        })))
    }, [sceneAttributeDefinitions])

    useEffect(() => {
        setShotAttributeDefsAsOptions(!shotAttributeDefinitions ? [] : shotAttributeDefinitions.map(d => ({
            label: d.name || "Unnamed",
            value: String(d.id)
        })))
    }, [shotAttributeDefinitions]);

    useEffect(() => {
        if(!shotlist || !shotlist.id) return

        //update preview
        setPreviewData(filterData(shotlistPreviewCache))

        //save settings to local storage
        const settingsObject: ExportSettingsLocalStorage = {
            selectedFileType: selectedFileType,
            hideSceneHeadings: hideSceneHeadings,
            pdfExportOptions: pdfExportOptions,
            selectedScenes: selectedScenes,
            selectedSceneAttributeDefs: selectedSceneAttributeDefs,
            selectedShotAttributeDefs: selectedShotAttributeDefs,
            customSceneFilters: customSceneFilters,
            customShotFilters: customShotFilters,
            customSceneSorts: customSceneSorts,
            customShotSorts: customShotSorts
        }
        const settingsString = JSON.stringify(settingsObject)
        localStorage.setItem(Config.localStorageKey.exportSettings(shotlist.id), settingsString)
    }, [
        selectedFileType,
        hideSceneHeadings,
        pdfExportOptions,
        selectedScenes,
        selectedSceneAttributeDefs,
        selectedShotAttributeDefs,
        customSceneFilters,
        customShotFilters,
        customSceneSorts,
        customShotSorts,
    ])

    useEffect(() => {
        setPreviewData(filterData(shotlistPreviewCache))
    }, [shotlistPreviewCache]);

    const generateFileName = () => {
        return `shotly_${shotlist?.name?.replace(/\s/g, "-") || "unnamed-shotlist"}_${wuTime.toDateTimeString(Date.now(), {timeSeparator: "-", dateSeparator: "-", dateTimeSeparator: "_"})}`
    }

    const loadSettingsFromLocalStorage = (shotlistId: string) => {
        const settingsString = localStorage.getItem(Config.localStorageKey.exportSettings(shotlistId))
        if (!settingsString) return

        const settingsObject = JSON.parse(settingsString) as ExportSettingsLocalStorage

        if(settingsObject.selectedFileType)
            setSelectedFileType(settingsObject.selectedFileType)
        if(settingsObject.hideSceneHeadings)
            setHideSceneHeadings(settingsObject.hideSceneHeadings)
        if(settingsObject.pdfExportOptions)
            setPdfExportOptions(settingsObject.pdfExportOptions)
        if(settingsObject.selectedScenes && settingsObject.selectedScenes.length > 0) {
            //only load scenes from LS that actually exists in the scenesAsOptions
            const filtered = settingsObject.selectedScenes
                .filter(selected => scenesAsOptions.some(option => option.value == selected.value))
            setSelectedScenes(filtered)
        }
        if(settingsObject.selectedSceneAttributeDefs) {
            const filtered = settingsObject.selectedSceneAttributeDefs
                .filter(selected => sceneAttributeDefinitions?.some(def => String(def.id) == selected.value))
            setSelectedSceneAttributeDefs(filtered)

            if(filtered.length > 0) visibleAttributesRef.current?.setIsExpanded(true)
        }
        if(settingsObject.selectedShotAttributeDefs) {
            const filtered = settingsObject.selectedShotAttributeDefs
                .filter(selected => shotAttributeDefinitions?.some(def => String(def.id) == selected.value))
            setSelectedShotAttributeDefs(filtered)

            if(filtered.length > 0) visibleAttributesRef.current?.setIsExpanded(true)
        }
        //check for def id to avoid loading filters in old (map) format
        if(settingsObject.customSceneFilters && settingsObject.customSceneFilters.length > 0 && settingsObject.customSceneFilters[0].definitionId) {
            //only load filters that reference an existing attributeDefinition id
            let filtered = settingsObject.customSceneFilters
                .filter(f => sceneAttributeDefinitions?.some(d => d.id == f.definitionId))
            //remove selected filter values that reference a non-existent select option
            filtered = filtered.map(
                f => {
                    const def = sceneAttributeDefinitions?.find(d => d.id == f.definitionId) as SceneSingleOrMultiSelectAttributeDefinition

                    return {
                        ...f,
                        value: f.value.filter(v => {
                            return def.options?.some(o => o?.id == v.value)
                        })
                    }
                }
            )
            setCustomSceneFilters(filtered)
        }
        //check for def id to avoid loading filters in old (map) format
        if(settingsObject.customShotFilters && settingsObject.customShotFilters.length > 0 && settingsObject.customShotFilters[0].definitionId) {
            //only load filters that reference an existing attributeDefinition id
            let filtered = settingsObject.customShotFilters
                .filter(f => shotAttributeDefinitions?.some(d => d.id == f.definitionId))
            //remove selected filter values that reference a non-existent select option
            filtered = filtered.map(
                f => {
                    const def = shotAttributeDefinitions?.find(d => d.id == f.definitionId) as ShotSingleOrMultiSelectAttributeDefinition

                    return {
                        ...f,
                        value: f.value.filter(v => {
                            return def.options?.some(o => o?.id == v.value)
                        })
                    }
                }
            )
            setCustomShotFilters(filtered)
        }
        if(settingsObject.customSceneSorts && settingsObject.customSceneSorts.length > 0) {
            let filtered = settingsObject.customSceneSorts
                .filter(s => sceneAttributeDefinitions?.some(d => d.id == s.definitionId))
            setCustomSceneSorts(filtered)
        }
        if(settingsObject.customShotSorts && settingsObject.customShotSorts.length > 0) {
            let filtered = settingsObject.customShotSorts
                .filter(s => shotAttributeDefinitions?.some(d => d.id == s.definitionId))
            setCustomShotSorts(filtered)
        }
    }

    const loadFilteredData = async () => {
        const queryResult = await loadData()

        if(!queryResult) return null;

        return filterData(queryResult)
    }

    async function loadData() {
        if(!shotlist) return null;

        const result: ApolloQueryResult<Query> = await client.query({
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
                                    definition{id, position}

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
                                        definition{id, position}

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
                                    sceneId
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

        result.data.shotlist?.scenes?.forEach(scene => {
            if(scene?.id != null && scene?.position != null)
                scenePositionLUT.current.set(scene.id, scene.position)
        })

        setShotlistPreviewCache(result)

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
        setHideSceneHeadings(false)
        setPdfExportOptions({
            showCheckboxes: false,
            avoidOrphans: true,
            repeatSceneHeading: false,
            repeatAttributeDefinitions: false,
            headerText: ""
        })
        setSelectedScenes([])
        setCustomSceneFilters([])
        setCustomShotFilters([])
        setCustomSceneFilters([])
        setCustomShotFilters([])

        successNotification({
            title: "All filters were reset to defaults"
        })
    }

    const filterData = (result: ApolloQueryResult<Query>): ShotlistDto | null => {
        let filteredScenes= wuGeneral.deepCopy<SceneDto[]>(result.data.shotlist?.scenes as SceneDto[] || [])

        if(!filteredScenes || filteredScenes.length == 0) return null

        //scene number filter
        if(selectedScenes.length > 0) {
            const selectedScenesArray = Array.from(selectedScenes.entries()).map(s => s[1].value)

            filteredScenes = filteredScenes.filter((scene) => selectedScenesArray.includes(String(scene.position)))
        }

        // scene filtering
        /**
         * returns true early if no filter is applicable or a filter exists and passed
         * returns false at the end to signify that none of the above were the case - not passed
         */
        filteredScenes = filteredScenes.filter((scene) => {
            const matchesFilters = (scene.attributes as AnySceneAttribute[]).every(attribute => {
                const filter = customSceneFilters.find(f => f.definitionId == attribute.definition?.id)

                if(!filter || filter.value.length == 0) return true //no filter was defined or no options were selected

                let filterIncludesValue = false
                let filterMatchesExactly = false

                switch (attribute.__typename){
                    case "SceneSingleSelectAttributeDTO":
                        const singleValueId = (attribute as SceneSingleSelectAttributeDto).singleSelectValue?.id
                        filterIncludesValue = filter.value.some(v => v.value == singleValueId)
                        filterMatchesExactly = filter.value[0].value == singleValueId
                        break
                    case "SceneMultiSelectAttributeDTO":
                        const multiValue = (attribute as SceneMultiSelectAttributeDto).multiSelectValue
                        filterIncludesValue = multiValue && multiValue.length > 0 &&
                            multiValue.some(value => value && filter.value.some(v => v.value == value.id))
                            || false
                        filterMatchesExactly = multiValue && multiValue.length == filter.value.length &&
                            multiValue.every(value => value && filter.value.some(v => v.value == value.id))
                            || false
                        break
                }

                if(
                    (filter.method == "include" && filterIncludesValue) ||
                    (filter.method == "exclude" && !filterIncludesValue) ||
                    (filter.method == "includeOnly" && filterMatchesExactly)
                )
                    return true

                return false //filters were not passed
            })

            return matchesFilters
        })

        // scene sorting
        filteredScenes.sort((a, b) => {
            for (let i = 0; i < customSceneSorts.length; i++) {
                const currentSort = customSceneSorts[i]

                const attributeA = a.attributes
                    ?.find(a => a?.definition?.id == currentSort.definitionId)

                const attributeB = b.attributes
                    ?.find(a => a?.definition?.id == currentSort.definitionId)

                if(!attributeA || !attributeB) continue

                const attributeValueA = SceneAttributeParser.toValueString(attributeA)
                const attributeValueB = SceneAttributeParser.toValueString(attributeB)

                if(attributeValueA == "" && attributeValueB == "") continue

                if (attributeValueA == "") return 1
                if (attributeValueB == "") return -1

                let result = attributeValueA.localeCompare(attributeValueB)

                if(currentSort.order == "descending") result *= -1

                if(result != 0) return result
            }

            return 0
        })

        // hide headings setting (merge all shots into first scene)
        if(hideSceneHeadings) {
            let allShots: ShotDto[] = []

            filteredScenes.forEach(scene => {
                const currentShots = (scene.shots as ShotDto[]) || []
                allShots.push(...currentShots)
            })

            filteredScenes[0].shots = allShots

            filteredScenes = filteredScenes.slice(0,1)
        }

        // shot filtering
        filteredScenes.forEach(scene => {
            if(!scene.shots || scene.shots.length == 0) return

            const filteredShots: ShotDto[] = []

            /**
             * For every shot - check if all the attributes match the filters
             * if any attribute does not match, the whole shot is not included
             *
             * Every attribute can only have one filter associated with it, so iterating over all the attributes and
             * then checking if a filter exists for each attribute covers all cases
             *
             * The shots of the scene are then replaced with only those that passed the filter (filteredShots)
             */
            scene.shots.forEach(shot => {
                if(!shot) return


                /**
                 * returns true early if no filter is applicable or a filter exists and passed
                 * returns false at the end to signify that none of the above were the case - not passed
                 */
                const matchesFilters = (shot.attributes as AnyShotAttribute[]).every(attribute => {
                    const filter = customShotFilters.find(f => f.definitionId == attribute.definition?.id)

                    if(!filter || filter.value.length == 0) return true //no filter was defined or no options were selected

                    let filterIncludesValue = false
                    let filterMatchesExactly = false

                    switch (attribute.__typename){
                        case "ShotSingleSelectAttributeDTO":
                            const singleValueId = (attribute as ShotSingleSelectAttributeDto).singleSelectValue?.id
                            filterIncludesValue = filter.value.some(v => v.value == singleValueId)
                            filterMatchesExactly = filter.value[0].value == singleValueId
                            break
                        case "ShotMultiSelectAttributeDTO":
                            const multiValue = (attribute as ShotMultiSelectAttributeDto).multiSelectValue

                             filterIncludesValue = multiValue && multiValue.length > 0 &&
                                multiValue.some(value => value && filter.value.some(v => v.value == value.id))
                                || false
                             filterMatchesExactly = multiValue && multiValue.length == filter.value.length &&
                                multiValue.every(value => value && filter.value.some(v => v.value == value.id))
                                || false
                            break
                    }

                    if(
                        (filter.method == "include" && filterIncludesValue) ||
                        (filter.method == "exclude" && !filterIncludesValue) ||
                        (filter.method == "includeOnly" && filterMatchesExactly)
                    )
                        return true

                    return false //filters were not passed
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

        // shot sorting
        filteredScenes.forEach(scene => {
            scene.shots?.sort((a, b) => {
                for (let i = 0; i < customShotSorts.length; i++) {
                    const currentSort = customShotSorts[i]

                    const attributeA = a?.attributes
                        ?.find(a => a?.definition?.id == currentSort.definitionId)

                    const attributeB = b?.attributes
                        ?.find(a => a?.definition?.id == currentSort.definitionId)

                    if(!attributeA || !attributeB) continue

                    const attributeValueA = ShotAttributeParser.toValueString(attributeA)
                    const attributeValueB = ShotAttributeParser.toValueString(attributeB)

                    if(attributeValueA == "" && attributeValueB == "") continue

                    if (attributeValueA == "") return 1
                    if (attributeValueB == "") return -1

                    let result = attributeValueA.localeCompare(attributeValueB)

                    if(currentSort.order == "descending") result *= -1

                    if(result != 0) return result
                }

                return 0
            })
        })

        // visible attributes

        let filteredSceneAttributeDefs = result.data.shotlist?.sceneAttributeDefinitions || []
        if(selectedSceneAttributeDefs.length > 0){
            filteredSceneAttributeDefs = filteredSceneAttributeDefs.filter(
                d => selectedSceneAttributeDefs.some(s => Number(s.value) == d?.id)
            )
        }

        let filteredShotAttributeDefs = result.data.shotlist?.shotAttributeDefinitions || []
        if(selectedShotAttributeDefs.length > 0){
            filteredShotAttributeDefs = filteredShotAttributeDefs.filter(
                d => selectedShotAttributeDefs.some(s => Number(s.value) == d?.id)
            )
        }

        filteredScenes = filteredScenes.map(scene => {
            let newAttributes = scene.attributes
            if(selectedSceneAttributeDefs.length > 0)
                newAttributes = newAttributes?.filter(
                    a => selectedSceneAttributeDefs.some(s => Number(s.value) == a?.definition?.id)
                )

            let newShots = scene.shots
            if(selectedShotAttributeDefs.length > 0)
                newShots = newShots?.map(shot => ({
                    ...shot,
                    attributes: shot?.attributes?.filter(
                        a => selectedShotAttributeDefs.some(s => Number(s.value) == a?.definition?.id)
                    )
                })) as ShotDto[]

            return {
                ...scene,
                attributes: newAttributes,
                shots: newShots
            }
        })

        return {
            ...result.data.shotlist,
            scenes: filteredScenes,
            sceneAttributeDefinitions: filteredSceneAttributeDefs,
            shotAttributeDefinitions: filteredShotAttributeDefs
        } as ShotlistDto;
    }

    async function exportShotlist() {
        infoNotification({
            title: "Generating your export!",
        })

        if(selectedFileType == "JSON") {
            exportJson()
            return
        }

        setExportRunning(true)

        const data: ShotlistDto | null = await loadFilteredData()

        if (!data) {
            errorNotification({
                title: "Export failed",
                message: "Could not load data for export.",
                tryAgainLater: true
            })
            setExportRunning(false)
            return
        }

        Analytics.signal("Shotlist.Options.Export.Exported", {
            fileType: selectedFileType,
            pdfExportOptions: pdfExportOptions,
            filterCount: customSceneFilters.length + customShotFilters.length,
            sortCount: customSceneSorts.length + customShotSorts.length,
            selectedScenes: setSelectedScenes.length
        })

        switch (selectedFileType) {
            case "CSV":
                exportCsv(data)
                break
            case "PDF":
                exportPdf(data)
                break
            case "XLSX":
                exportXlsx(data)
                break
        }
        
        setTimeout(() => {
            setExportRunning(false)
        },2000)
    }

    //FILTERS

    const addSceneFilter = (attributeDefinitionId: number) => {
        setCustomSceneFilters(current => [
            ...current,
            {
                definitionId: attributeDefinitionId,
                method: "include",
                value: []
            }
        ])
    }

    const addShotFilter = (attributeDefinitionId: number) => {
        setCustomShotFilters(current => [
            ...current,
            {
                definitionId: attributeDefinitionId,
                method: "include",
                value: []
            }
        ])
    }

    const setSceneFilterValue = (attributeDefinitionId: number, value: MultiValue<SelectOption>) => {
        setCustomSceneFilters(current => current.map(f => {
            if(f.definitionId == attributeDefinitionId) {
                return {
                    ...f,
                    value: value
                }
            }
            return f
        }))
    }

    const setShotFilterValue = (attributeDefinitionId: number, value: MultiValue<SelectOption>) => {
        setCustomShotFilters(current => current.map(f => {
            if(f.definitionId == attributeDefinitionId) {
                return {
                    ...f,
                    value: value
                }
            }
            return f
        }))
    }

    const removeSceneFilter = (attributeDefinitionId: number) => {
        setCustomSceneFilters(current => current.filter(f => f.definitionId != attributeDefinitionId))
    }

    const removeShotFilter = (attributeDefinitionId: number) => {
        setCustomShotFilters(current => current.filter(f => f.definitionId != attributeDefinitionId))
    }

    const toggleSceneFilterMethod = (attributeDefinitionId: number) => {
        setCustomSceneFilters(current => current.map(f => {
            if(f.definitionId == attributeDefinitionId) {
                const newMethod =
                    f.method == "include" ? "includeOnly" :
                    f.method == "includeOnly" ? "exclude" :
                        "include"
                return {...f, method: newMethod}
            }

            return f
        }))
    }

    const toggleShotFilterMethod = (attributeDefinitionId: number) => {
        setCustomShotFilters(current => current.map(f => {
            if(f.definitionId == attributeDefinitionId) {
                const newMethod =
                    f.method == "include" ? "includeOnly" :
                    f.method == "includeOnly" ? "exclude" :
                        "include"
                return {...f, method: newMethod}
            }

            return f
        }))
    }

    // SORTS

    const addSceneSort = (attributeDefinitionId: number) => {
        console.log("adding scene sort")

        setCustomSceneSorts(current => [
            ...current,
            {
                definitionId: attributeDefinitionId,
                order: "ascending"
            }
        ])
    }

    const addShotSort = (attributeDefinitionId: number) => {
        setCustomShotSorts(current => [
            ...current,
            {
                definitionId: attributeDefinitionId,
                order: "ascending"
            }
        ])
    }

    const reverseSceneSort = (attributeDefinitionId: number) => {
        setCustomSceneSorts(current => current.map(s => {
            if(s.definitionId == attributeDefinitionId) {
                const newOrder = s.order == "ascending" ? "descending" : "ascending"
                return {...s, order: newOrder}
            }

            return s
        }))
    }

    const reverseShotSort = (attributeDefinitionId: number) => {
        setCustomShotSorts(current => current.map(s => {
            if(s.definitionId == attributeDefinitionId) {
                const newOrder = s.order == "ascending" ? "descending" : "ascending"
                return {...s, order: newOrder}
            }

            return s
        }))
    }

    const removeSceneSort = (attributeDefinitionId: number) => {
        setCustomSceneSorts(current => current.filter(s => s.definitionId != attributeDefinitionId))
    }

    const removeShotSort = (attributeDefinitionId: number) => {
        setCustomShotSorts(current => current.filter(s => s.definitionId != attributeDefinitionId))
    }

    const sceneSortContainer = useCallback((node: HTMLDivElement | null) => {
        if (sceneSortContainerRef.current) {
            sceneSortContainerRef.current.destroy()
            sceneSortContainerRef.current = null
        }

        if (node) {
            sceneSortContainerRef.current = Sortable.create(node, {
                handle: '.grip',
                animation: 150,
                forceFallback: true,
                fallbackTolerance: 5,
                onStart: (event) => {
                    if (event.oldIndex === undefined) return

                    appContext.setElementIsBeingDragged(true)
                },
                onEnd: (event) => {
                    appContext.setElementIsBeingDragged(false)

                    if(!event.item || event.oldIndex == undefined || event.newIndex == undefined) return

                    setCustomSceneSorts(current => {
                        let newSorts = [...current]
                        newSorts = Utils.reorderArray(newSorts, event.oldIndex || -1, event.newIndex || -1)
                        return newSorts
                    })
                }
            })
        }
    }, [])

    const shotSortContainer = useCallback((node: HTMLDivElement | null) => {
        if (shotSortContainerRef.current) {
            shotSortContainerRef.current.destroy()
            shotSortContainerRef.current = null
        }

        if (node) {
            shotSortContainerRef.current = Sortable.create(node, {
                handle: '.grip',
                animation: 150,
                forceFallback: true,
                fallbackTolerance: 5,
                onStart: (event) => {
                    if (event.oldIndex === undefined) return

                    appContext.setElementIsBeingDragged(true)
                },
                onEnd: (event) => {
                    appContext.setElementIsBeingDragged(false)

                    if(!event.item || event.oldIndex == undefined || event.newIndex == undefined) return

                    setCustomShotSorts(current => {
                        let newSorts = [...current]
                        newSorts = Utils.reorderArray(newSorts, event.oldIndex || -1, event.newIndex || -1)
                        return newSorts
                    })
                }
            })
        }
    }, [])

    const {exportPdf} = usePdfExport({generateFileName, pdfExportOptions, hideSceneHeadings, scenePositionLUT})
    const {exportCsv} = useCsvExport({generateFileName, hideSceneHeadings, scenePositionLUT})
    const {exportXlsx} = useXlsxExport({generateFileName, hideSceneHeadings, scenePositionLUT})
    const {exportJson} = useJsonExport({generateFileName, shotlistId: shotlist?.id || null, filterData, setExportRunning})

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

    const exist = {
        filters: (customSceneFilters.length + customShotFilters.length) > 0,
        sorts: (customSceneSorts.length + customShotSorts.length) > 0
    }

    const dataStats = {
        scenes: previewData?.scenes?.length ?? -1,
        shots: previewData?.scenes?.reduce((sum, s) => sum + (s?.shots?.length ?? 0), 0) ?? -1
    }

    return (
        <div className={"shotlistOptionsDialogExportTab shotlistOptionsDialogPage"}>
            <div className="top">
                <h2>Configure the export</h2>
                <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>

            {/* DEFAUlT FILTERS */}

            <div className="settings">
                <div className="setting">
                    <div className="left">
                        <File size={22}/>
                        <p>Format</p>
                    </div>

                    <SimpleSelect
                        name="File Type"
                        onChange={newValue => setSelectedFileType(newValue as ExportFileTypes)}
                        options={[
                            {value: "PDF", label: "PDF"},
                            {value: "XLSX", label: "XLSX"},
                            {value: "CSV", label: "CSV"},
                            {value: "JSON", label: "JSON"},
                        ]}
                        value={selectedFileType}
                        fontSize={".9rem"}
                    />
                </div>
                <div className="setting">
                    <div className="left">
                        <Rows4 size={22}/>
                        <p>Hide scene headings</p>
                    </div>

                    <Switch.Root
                        className="SwitchRoot"
                        checked={hideSceneHeadings}
                        onCheckedChange={setHideSceneHeadings}
                    >
                        <Switch.Thumb className="SwitchThumb"/>
                    </Switch.Root>
                </div>
                {
                    selectedFileType == "PDF" &&
                    <>
                        <PdfSettings
                            pdfExportOptions={pdfExportOptions}
                            setPdfExportOptions={setPdfExportOptions}
                        />
                    </>
                }
                <div className="setting">
                    <div className="left">
                        <ListOrdered size={22}/>
                        <p>Scenes</p>
                    </div>

                    <MultiSelect
                        name={"Scenes"}
                        placeholder={"All scenes"}
                        options={scenesAsOptions}
                        value={selectedScenes}
                        onChange={newValue => {
                            setSelectedScenes(newValue)
                        }}
                        sorted={true}
                        minWidth={"20rem"}
                    />
                </div>
                <SimpleCollapse
                    name={"Visible Attributes"}
                    contentClassName={"visibleAttributes"}
                    ref={visibleAttributesRef}
                >
                    <div className="setting">
                        <div className="left">
                            <ListOrdered size={22}/>
                            <p>Scene</p>
                        </div>

                        <MultiSelect
                            name={"Scenes"}
                            placeholder={"All scene attributes"}
                            options={sceneAttributeDefsAsOptions}
                            value={selectedSceneAttributeDefs}
                            onChange={setSelectedSceneAttributeDefs}
                            sorted={true}
                            minWidth={"20rem"}
                        />
                    </div>
                    <div className="setting">
                        <div className="left">
                            <Table size={22}/>
                            <p>Shot</p>
                        </div>

                        <MultiSelect
                            name={"Scenes"}
                            placeholder={"All shot attributes"}
                            options={shotAttributeDefsAsOptions}
                            value={selectedShotAttributeDefs}
                            onChange={setSelectedShotAttributeDefs}
                            sorted={true}
                            minWidth={"20rem"}
                        />
                    </div>
                </SimpleCollapse>
            </div>

            {(exist.filters || exist.sorts) && <Separator/>}

            {exist.filters && <h3>Filters</h3>}

            {/* CUSTOM SCENE FILTERS */}

            {customSceneFilters.length > 0 && <h4>Scenes</h4>}
            <div className="settings secondary">
                {Array.from(customSceneFilters).map((filter, index) => {
                    const definition = sceneAttributeDefinitions?.find(def => def?.id === filter.definitionId) as SceneSingleOrMultiSelectAttributeDefinition

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
                            filter={filter}
                            Icon={Icon}
                            name={definition.name || "Unnamed"}
                            isMulti={SceneAttributeDefinitionParser.isMulti(definition)}
                            options={options}
                            onChange={newValue => {
                                setSceneFilterValue(definition.id, newValue)
                            }}
                            onRemove={() => removeSceneFilter(definition.id)}
                            onToggleMethod={() => toggleSceneFilterMethod(definition.id)}
                        />
                        {customSceneFilters.length > index+1 && <p className="combinationInfo">and</p>}
                    </Fragment>)
                })}
            </div>

            {/* CUSTOM SHOT FILTERS */}

            {customShotFilters.length > 0 && <h4>Shots</h4>}
            <div className="settings secondary">
                {Array.from(customShotFilters).map((filter, index) => {
                    const definition = shotAttributeDefinitions?.find(def => def?.id === filter.definitionId) as ShotSingleOrMultiSelectAttributeDefinition

                    if(!definition) return null

                    const Icon = ShotAttributeDefinitionParser.toIcon(definition)
                    const options = (definition.options as ShotSelectAttributeOptionDefinition[])
                        ?.map(option =>
                            ({value: option.id.toString(), label: option.name || "Unnamed"})
                        ) || []

                    return (<Fragment key={definition.id}>
                        <ExportFilter
                            filter={filter}
                            Icon={Icon}
                            name={definition.name || "Unnamed"}
                            isMulti={ShotAttributeDefinitionParser.isMulti(definition)}
                            options={options}
                            onChange={newValue => {
                                setShotFilterValue(definition.id, newValue)
                            }}
                            onRemove={() => removeShotFilter(definition.id)}
                            onToggleMethod={() => toggleShotFilterMethod(definition.id)}
                        />
                        {customShotFilters.length > index+1 && <p className="combinationInfo">and</p>}
                    </Fragment>)
                })}
            </div>

            {exist.sorts && <h3>Ordering</h3>}

            {/* CUSTOM SCENE SORTS */}

            {customSceneSorts.length > 0 && <h4>Scenes</h4>}
            <div className="settings secondary" ref={sceneSortContainer}>
                {customSceneSorts.map((sort, index) => {
                    const definition = sceneAttributeDefinitions?.find(def => def?.id === sort.definitionId) as SceneSingleOrMultiSelectAttributeDefinition

                    if(!definition) return null

                    return <ExportSort
                        key={definition.id}
                        name={definition.name || "Unnamed"}
                        order={sort.order}
                        onRemove={() => removeSceneSort(sort.definitionId)}
                        onReverseOrder={() => reverseSceneSort(sort.definitionId)}
                    />
                })}
            </div>

            {/* CUSTOM SHOT SORTS */}

            {customShotSorts.length > 0 && <h4>Shots</h4>}
            <div className="settings secondary" ref={shotSortContainer}>
                {customShotSorts.map((sort, index) => {
                    const definition = shotAttributeDefinitions?.find(def => def?.id === sort.definitionId) as ShotSingleOrMultiSelectAttributeDefinition

                    if(!definition) return null

                    return <ExportSort
                        key={definition.id}
                        name={definition.name || "Unnamed"}
                        order={sort.order}
                        onRemove={() => removeShotSort(sort.definitionId)}
                        onReverseOrder={() => reverseShotSort(sort.definitionId)}
                    />
                })}
            </div>

            <div className="addButtons">
                <AddExportFilterPopover
                    sceneAttributeDefinitions={sceneAttributeDefinitions}
                    shotAttributeDefinitions={shotAttributeDefinitions}
                    customSceneFilters={customSceneFilters}
                    customShotFilters={customShotFilters}
                    addSceneFilter={addSceneFilter}
                    addShotFilter={addShotFilter}
                />
                <AddExportSortPopover
                    sceneAttributeDefinitions={sceneAttributeDefinitions}
                    shotAttributeDefinitions={shotAttributeDefinitions}
                    customSceneSorts={customSceneSorts}
                    customShotSorts={customShotSorts}
                    addSceneSort={addSceneSort}
                    addShotSort={addShotSort}
                />
            </div>

            <span className="scrollSpacer" aria-hidden></span>


            <div className="bottom">
                <p className="small">
                    {"Exporting "}
                    {dataStats.shots >= 0 ? dataStats.shots : "##"}
                    {` shot${dataStats.shots == 1 ? "" : "s"} from `}
                    {dataStats.scenes >= 0 ? dataStats.scenes : "##"}
                    {` scene${dataStats.scenes == 1 ? "" : "s"}.`}
                </p>

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
                <ExportPreview
                    data={previewData}
                    exportShotlist={exportShotlist}
                    hideSceneHeadings={hideSceneHeadings}
                    scenePositionLUT={scenePositionLUT}
                />
                <button className="secondary" onClick={resetValues}>
                    <span>Reset</span> <RotateCcw size={16} strokeWidth={2.5}/>
                </button>

                <HelpLink link="https://docs.shotly.at/shotlist/export" name={"Export"}/>
            </div>

            {ConfirmDialog}
        </div>
    )
}