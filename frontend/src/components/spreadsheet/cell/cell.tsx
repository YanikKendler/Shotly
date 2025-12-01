import {forwardRef, memo, ReactNode, useContext, useEffect, useImperativeHandle, useRef} from "react"
import "./cell.scss"
import {AnyShotAttribute} from "@/util/Types"
import CellTextInput from "@/components/spreadsheet/cell/input/cellTextInput/cellTextInput"
import CellSingleSelectInput from "@/components/spreadsheet/cell/input/cellSingleSelectInput/cellSingleSelectInput"
import CellMultiSelectInput from "@/components/spreadsheet/cell/input/cellMultiSelectInput/cellMultiSelectInput"
import {ShotlistContext} from "@/context/ShotlistContext"

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
    onClick
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
            className={`sheetCell ${type.join(" ")}`}
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