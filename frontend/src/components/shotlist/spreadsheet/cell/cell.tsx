import {forwardRef, memo, ReactNode, useContext, useImperativeHandle, useRef} from "react"
import "./cell.scss"
import {AnyShotAttribute} from "@/util/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import CellTextInput from "../input/cellTextInput/cellTextInput"
import CellSingleSelectInput from "../input/cellSingleSelectInput/cellSingleSelectInput"
import CellMultiSelectInput from "../input/cellMultiSelectInput/cellMultiSelectInput"
import {ShotAttributeParser} from "@/util/AttributeParser"
import {wuConstants} from "@yanikkendler/web-utils/dist"

export interface CellInputRef {
    setFocus: () => void
}

export interface CellRef {
    setFocus: () => void
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

    const setFocus = () => {
        inputRef.current?.setFocus()
    }

    const localRef = useRef<CellRef>({
        setFocus: setFocus,
        row,
        column
    })

    useImperativeHandle(ref, () => localRef.current)

    const renderInput = () => {
        if(!attribute) return

        if(isReadOnly == true) {
            const readOnlyValue = ShotAttributeParser.toValueString(attribute, false)
            if(wuConstants.Regex.empty.test(readOnlyValue))
                return <p className="readOnlyValue empty">Unset</p>
            return <p className="readOnlyValue">{ShotAttributeParser.toValueString(attribute, false)}</p>
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