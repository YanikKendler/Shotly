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
import {pdf} from "@react-pdf/renderer"
import PDFExport, {PDFExportOptions} from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/PDFExport"
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
    SceneAttributeParser,
    ShotAttributeDefinitionParser,
    ShotAttributeParser
} from "@/utility/AttributeParser"
//@ts-ignore
import {downloadCSV} from "../../../../../../lib/downloadCSV"
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
import * as XLSX from 'xlsx-js-style';
import ExportPreview from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportPreview/exportPreview"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"
import {wuText} from "@yanikkendler/web-utils/dist"
import SimplePopover, {SimplePopoverRef} from "@/components/basic/popover/simplePopover"

type SelectedFileTypes = "PDF" | "CSV-small" | "CSV-full" | "XLSX"

interface ExportSettingsLocalStorage {
    selectedFileType?: SelectedFileTypes
    pdfExportOptions?: PDFExportOptions
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
    const [pdfExportOptions, setPdfExportOptions] = useState<PDFExportOptions>({
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

    const previewDialogRef = useRef<DialogRef>(null);

    const addFilterPopoverRef = useRef<SimplePopoverRef>(null);

    //load settings from local storage
    useEffect(() => {
        if(!shotlist || !shotlist.id) return

        loadDataForExport().then(data => {
            if(!data) return

            setShotlistPreviewCache(data)
        })

        if(!Utils.getUserSettingsFromLocalStorage().saveExportSettingsInLocalstorage) return

        loadSettingsFromLocalStorage(shotlist.id)
        extractScenesAsOptions()
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

    const extractScenesAsOptions = () => {
        let newSceneOptions: SelectOption[] = [];
        shotlist?.scenes?.forEach((s, i) => {
            newSceneOptions.push({
                value: i.toString(),
                label: wuText.truncate(
                    `${(i + 1).toString()} - ${Utils.sceneAttributesToSceneName(s?.attributes as AnySceneAttribute[])}`
                    , 35
                )
            });
        })
        setScenesAsOptions(newSceneOptions)
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
                exportCSVSmall(data)
                break
            case "CSV-full":
                exportCSVFull(data)
                break
            case "PDF":
                exportPDF(data)
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
        const blob = await pdf(<PDFExport data={data} options={pdfExportOptions}/>).toBlob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = generateFileName() + ".pdf"
        link.click()
        URL.revokeObjectURL(url)
    }

    //AI
    const exportXLSX = (data: ShotlistDto) => {
        const rows: any[][] = [];

        const sceneValueRowIndices: number[] = [];
        const shotHeaderRowIndices: number[] = [];
        const coloredShotRowIndices: number[] = [];

        // 1. Initial Global Header: Scene Attribute Definitions
        const globalHeader = [
            "Scene",
            ...(data.sceneAttributeDefinitions || []).map(attr => attr?.name || "Unnamed")
        ];
        rows.push(globalHeader);

        // 2. Prepare Shot Attribute Names Row
        const shotAttrNames = [
            "Shot",
            ...(data.shotAttributeDefinitions || []).map(attr => attr?.name || "Unnamed")
        ];

        // 3. Build Data
        (data.scenes || []).forEach((scene) => {
            if (!scene) return;

            // Line 1: Scene values
            const sceneValRow: any[] = [scene.position + 1];
            (scene.attributes || []).forEach((attr) => {
                sceneValRow.push(SceneAttributeParser.toValueString(attr as any, false));
            });
            sceneValueRowIndices.push(rows.length);
            rows.push(sceneValRow);

            // Line 2: Shot attribute names
            shotHeaderRowIndices.push(rows.length);
            rows.push(shotAttrNames);

            // Shots
            (scene.shots || []).forEach((shot, shotIdx) => {
                if (!shot) return;
                const shotRow: any[] = [Utils.numberToShotLetter(shot.position, scene.position)];
                (shot.attributes || []).forEach((attr) => {
                    shotRow.push(ShotAttributeParser.toValueString(attr as any, false));
                });

                if (shotIdx % 2 !== 0) {
                    coloredShotRowIndices.push(rows.length);
                }
                rows.push(shotRow);
            });
        });

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");

        // 4. Column Sizing
        worksheet['!cols'] = [
            { wch: 6 },
            ...Array(range.e.c).fill({ wch: 30 })
        ];

        // 5. Apply Styles
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[address]) worksheet[address] = { t: 's', v: '' };

                const isGlobalHeader = R === 0;
                const isSceneValRow = sceneValueRowIndices.includes(R);
                const isShotHeadRow = shotHeaderRowIndices.includes(R);
                const isHeaderBlock = isSceneValRow || isShotHeadRow;
                const isColoredShot = coloredShotRowIndices.includes(R);
                const isFirstCol = (C === 0);

                const lightGridColor = { rgb: "DCDCDC" };
                const darkHeaderGridColor = { rgb: "808080" };

                const style: any = {
                    alignment: {
                        vertical: "center",
                        horizontal: isFirstCol ? "center" : "left",
                        wrapText: true,
                        indent: isFirstCol ? 0 : 1
                    },
                    font: { name: "Arial", sz: 11, bold: false },
                    fill: { fgColor: { rgb: isColoredShot ? "EFEFEF" : "FFFFFF" } },
                    border: {
                        top: { style: "thin", color: lightGridColor },
                        bottom: { style: "thin", color: lightGridColor },
                        left: { style: "thin", color: lightGridColor },
                        right: { style: "thin", color: lightGridColor }
                    }
                };

                // Header Block Logic
                if (isHeaderBlock) {
                    style.fill = { fgColor: { rgb: "C7C7C7" } };

                    // Remove left/right borders from heading as requested
                    style.border.left = { style: "none" };
                    style.border.right = { style: "none" };

                    // Vertical separators within the header use the dark gray
                    style.border.right = { style: "thin", color: darkHeaderGridColor };

                    if (isSceneValRow) {
                        style.font.bold = true; // First line of heading bold
                        style.font.sz = 12;
                        style.border.top = { style: "medium", color: { rgb: "000000" } };
                        // Thin black border between first and second line
                        style.border.bottom = { style: "thin", color: { rgb: "000000" } };
                    }

                    if (isShotHeadRow) {
                        style.border.top = { style: "thin", color: { rgb: "000000" } };
                        style.border.bottom = { style: "medium", color: { rgb: "000000" } };
                    }
                } else if (isGlobalHeader) {
                    // Very first line: No color, bold font
                    style.fill = { fgColor: { rgb: "FFFFFF" } };
                }

                worksheet[address].s = style;
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Shotlist");
        XLSX.writeFile(workbook, `${generateFileName()}.xlsx`);
    };

    const generateFileName = () => {
        return `shotly_${shotlist?.name?.replace(/\s/g, "-") || "unnamed-shotlist"}_${wuTime.toDateTimeString(Date.now(), {timeSeparator: "-", dateSeparator: "-", dateTimeSeparator: "_"})}`
    }

    const addShotFilter = (attributeDefinitionId: number) => {
        addFilterPopoverRef.current?.close()

        const newCustomFilters = new Map(customShotFilters)
        newCustomFilters.set(attributeDefinitionId, [])
        setCustomShotFilters(newCustomFilters)
    }

    const addSceneFilter = (attributeDefinitionId: number) => {
        addFilterPopoverRef.current?.close()

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
                        <div className="filter">
                            <div className="left">
                                <SquareCheck size={20}/>
                                <p>Add checkboxes</p>
                            </div>

                            <Switch.Root
                                className="SwitchRoot"
                                checked={pdfExportOptions.showCheckboxes}
                                onCheckedChange={(checked) => setPdfExportOptions(current => ({...current, showCheckboxes: checked}))}
                            >
                                <Switch.Thumb className="SwitchThumb"/>
                            </Switch.Root>
                        </div>
                        <div className="filter">
                            <div className="left">
                                <Type size={20}/>
                                <p>Header text (optional)</p>
                            </div>

                            <TextField
                                value={pdfExportOptions.headerText}
                                valueChange={(value) => setPdfExportOptions(current => ({...current, headerText: value}))}
                                placeholder={"Any text"}
                                clearable
                            />
                        </div>
                        <Collapse name={"Advanced settings"}>
                            <div className="filter">
                                <div className="left">
                                    <LucideWrapText size={20}/>
                                    <p>Avoid orphaned shots when wrapping</p>
                                </div>

                                <Switch.Root
                                    className="SwitchRoot"
                                    checked={pdfExportOptions.avoidOrphans}
                                onCheckedChange={(checked) => setPdfExportOptions(current => ({...current, avoidOrphans: checked}))}
                                >
                                    <Switch.Thumb className="SwitchThumb"/>
                                </Switch.Root>
                            </div>
                            <div className="filter">
                                <div className="left">
                                    <Heading size={20}/>
                                    <p>Repeat scene headings after page breaks</p>
                                </div>

                                <Switch.Root
                                    className="SwitchRoot"
                                    checked={pdfExportOptions.repeatSceneHeading}
                                onCheckedChange={(checked) => setPdfExportOptions(current => ({...current, repeatSceneHeading: checked}))}
                                >
                                    <Switch.Thumb className="SwitchThumb"/>
                                </Switch.Root>
                            </div>
                            <div className="filter">
                                <div className="left">
                                    <Repeat size={20}/>
                                    <p>Repeat scene attribute names on every page</p>
                                </div>

                                <Switch.Root
                                    className="SwitchRoot"
                                    checked={pdfExportOptions.repeatAttributeDefinitions}
                                    onCheckedChange={(checked) => setPdfExportOptions(current => ({...current, repeatAttributeDefinitions: checked}))}
                                >
                                    <Switch.Thumb className="SwitchThumb"/>
                                </Switch.Root>
                            </div>
                        </Collapse>
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

            <SimplePopover
                ref={addFilterPopoverRef}
                className={"addFilter"}
                contentClassName={"addFilterPopup"}
                showArrow={false}
                content={<>
                    <h3>Scene</h3>
                    {
                        !customSceneFilterCandidates || customSceneFilterCandidates?.length <= 0 ?
                            <p className="empty">None left</p> :
                            customSceneFilterCandidates?.map((attributeDefinition, index) => (
                                <button
                                    key={index}
                                    onClick={() => addSceneFilter(attributeDefinition?.id || -1)}
                                >
                                    {attributeDefinition?.name || "Unnamed"}
                                </button>
                            ))
                    }
                    <h3>Shot</h3>
                    {
                        !customShotFilterCandidates || customShotFilterCandidates?.length <= 0 ?
                            <p className="empty">None left</p> :
                            customShotFilterCandidates.map((attributeDefinition, index) => (
                                <button
                                    key={index}
                                    onClick={() => addShotFilter(attributeDefinition?.id || -1)}
                                >
                                    {attributeDefinition?.name || "Unnamed"}
                                </button>
                            ))
                    }
                </>}
            >
                Add filter <Plus size={20}/>
            </SimplePopover>

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
                <button className="secondary" onClick={previewDialogRef.current?.open}>
                    <span>Preview</span> <Eye size={16} strokeWidth={2.5}/>
                </button>
                <button className="secondary" onClick={resetValues}>
                    <span>Reset</span> <RotateCcw size={16} strokeWidth={2.5}/>
                </button>
                <Dialog contentClassName={"pdfPreviewDialogContent"} ref={previewDialogRef}>
                    <div className="top sticky">
                        <h1>Export preview</h1>
                        <button
                            className={"export"}
                            onClick={() => {
                                previewDialogRef.current?.close()
                                exportShotlist()
                            }}
                        >
                            <span>Download shotlist</span><Download size={16} strokeWidth={3}/>
                        </button>
                        <button className={"close"} onClick={previewDialogRef.current?.close}>
                            <span>Close preview</span><X size={18} strokeWidth={3}/>
                        </button>
                    </div>
                    <ExportPreview data={filterData(shotlistPreviewCache)}/>
                    <p className="small">If a collaborator has edited the shotlist, the preview might not be fully up to date, but the final export will be.</p>
                </Dialog>

                <HelpLink link="https://docs.shotly.at/shotlist/export" name={"Export"}/>
            </div>

            {ConfirmDialog}
        </div>
    )
}