import {forwardRef, memo, ReactNode, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import "./cell.scss"
import {AnyShotAttribute, SelectOption} from "@/util/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import CellTextInput from "../input/cellTextInput/cellTextInput"
import CellSingleSelectInput from "../input/cellSingleSelectInput/cellSingleSelectInput"
import CellMultiSelectInput from "../input/cellMultiSelectInput/cellMultiSelectInput"
import {ShotAttributeParser} from "@/util/AttributeParser"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {ShotAttributeValueMultiType} from "@/service/ShotlistSyncService"

export interface CellInputRef {
    setFocus: () => void
    setValue: (value: ShotAttributeValueMultiType) => void
}

export interface CellRef {
    setFocus: () => void
    setValue: (value: ShotAttributeValueMultiType) => void
    setReadOnlyValue: (value: string) => void
    id: number
    row: number
    column: number
}

interface CellProps {
    attribute?: AnyShotAttribute
    type?: ("default" | "number" | "create" | "loader")[]
    children?: ReactNode
    row: number
    column: number
    onClick?: () => void
    isReadOnly?: boolean
}

/**
 * Represents a single cell in the spreadsheet aka a shot attribute
 * @param children
 * @param type the purpose of the cell, affects styling - default or number (shot number on the left)
 * @constructor
 */
const CellBase = forwardRef<CellRef, CellProps>(({
    attribute,
    type = ["default"],
    children,
    row,
    column,
    onClick,
    isReadOnly
}, ref)=> {
    const inputRef = useRef<CellInputRef>(null)
    const shotlistContext = useContext(ShotlistContext)

    const [readOnlyValue, setReadOnlyValue] = useState<string>("")

    useEffect(() => {
        if(isReadOnly == true && attribute){
            setReadOnlyValue(ShotAttributeParser.toValueString(attribute, false))
        }
    }, [isReadOnly, attribute]);

    useImperativeHandle(ref, () => ({
        id: attribute?.id ?? -1,
        row,
        column,
        setFocus() {
            inputRef.current?.setFocus()
        },
        setValue(value) {
            inputRef.current?.setValue(value)
        },
        setReadOnlyValue(value: string) {
            setReadOnlyValue(value)
        }
    }))

    const renderInput = () => {
        if(!attribute) return

        if(isReadOnly == true) {
            if(wuConstants.Regex.empty.test(readOnlyValue))
                return <p className="readOnlyValue empty">Unset</p>
            return <p className="readOnlyValue">{readOnlyValue}</p>
        }

        switch (attribute.__typename) {
            case "ShotTextAttributeDTO":
                return <CellTextInput attribute={attribute} ref={inputRef} />
            case "ShotSingleSelectAttributeDTO":
                return <CellSingleSelectInput attribute={attribute} ref={inputRef} />
            case "ShotMultiSelectAttributeDTO":
                return <CellMultiSelectInput attribute={attribute} ref={inputRef} />
            default:
                return <p>unknown attribute - please report this as a bug</p>
        }
    }

    return (
        <div
            className={`sheetCell ${type.join(" ")} ${isReadOnly && "readOnly"}`}
            onClick={() => {
                if(onClick) {
                    onClick()
                }
            }}
            onFocus={() => {
                if(type.includes("default")) {
                    shotlistContext.focusedCell.current = {row: row, column: column}
                }
            }}
        >
            {renderInput()}
            {children}
        </div>
    )
})

export const Cell = memo(CellBase)