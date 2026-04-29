import Separator from "@/components/basic/separator/separator"
import React, {Dispatch, SetStateAction} from "react"
import {Heading, LucideWrapText, Repeat, SquareCheck, Type} from "lucide-react"
import TextField from "@/components/basic/textField/textField"
import Collapse from "@/components/basic/collapse/collapse"
import { Switch } from "radix-ui"
import {PdfExportOptions} from "@/service/export/usePdfExport"
import SimpleCollapse from "@/components/basic/simpleCollapse/simpleCollapse"

export default function PdfSettings({
    pdfExportOptions,
    setPdfExportOptions
}:{
    pdfExportOptions: PdfExportOptions
    setPdfExportOptions: Dispatch<SetStateAction<PdfExportOptions>>
}){
    return (<>
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
        <SimpleCollapse name={"Advanced settings"}>
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
        </SimpleCollapse>
    </>)
}