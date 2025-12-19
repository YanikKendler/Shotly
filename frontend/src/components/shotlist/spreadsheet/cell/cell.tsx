import {forwardRef, memo, ReactNode, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import "./cell.scss"
import {AnyShotAttribute, SelectOption, ShotAttributeValueMultiType} from "@/util/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import CellTextInput from "../input/cellTextInput/cellTextInput"
import CellSingleSelectInput from "../input/cellSingleSelectInput/cellSingleSelectInput"
import CellMultiSelectInput from "../input/cellMultiSelectInput/cellMultiSelectInput"
import {ShotAttributeParser} from "@/util/AttributeParser"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {
    ShotMultiSelectAttributeDto,
    ShotSingleSelectAttributeDto,
    ShotTextAttributeDto
} from "../../../../../lib/graphql/generated"

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
    setCollaboratorHighlight: (userId: string) => void
    removeCollaboratorHighlight: (userId: string) => void
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
    const internalRef = useRef<HTMLDivElement>(null)
    const shotlistContext = useContext(ShotlistContext)

    const [readOnlyValue, setReadOnlyValue] = useState<string>("")

    const [isBlockedByCollaborator, setIsBlockedByCollaborator] = useState(false)

    useEffect(() => {
        if(attribute){
            setReadOnlyValue(ShotAttributeParser.toValueString(attribute, false))
        }
    }, [attribute]);

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
        },
        setCollaboratorHighlight(userId: string){
            setIsBlockedByCollaborator(true)
        },
        removeCollaboratorHighlight(userId: string){
            setIsBlockedByCollaborator(false)
        }
    }))

    const renderInput = () => {
        if(!attribute) return

        if(isReadOnly == true) {
            if(!readOnlyValue || wuConstants.Regex.empty.test(readOnlyValue))
                return <p className="readOnlyValue empty">Unset</p>
            return <p className="readOnlyValue">{readOnlyValue}</p>
        }

        switch (attribute.type) {
            case "ShotTextAttributeDTO":
                return <CellTextInput attribute={attribute as ShotTextAttributeDto} ref={inputRef} />
            case "ShotSingleSelectAttributeDTO":
                return <CellSingleSelectInput attribute={attribute as ShotSingleSelectAttributeDto} ref={inputRef} />
            case "ShotMultiSelectAttributeDTO":
                return <CellMultiSelectInput attribute={attribute as ShotMultiSelectAttributeDto} ref={inputRef} />
            default:
                return <p>unknown attribute - please report this as a bug</p>
        }
    }

    return (
        <div
            className={`sheetCell ${type.join(" ")} ${isReadOnly && "readOnly"} ${isBlockedByCollaborator && "readOnly collaboratorHighlight"}`}
            onClick={() => {
                if(onClick) {
                    onClick()
                }
            }}
            onFocus={() => {
                if(type.includes("default")) {
                    shotlistContext.setFocusedCell(row, column)
                }
            }}
            onBlur={() => {
                if(type.includes("default")) {
                    shotlistContext.setFocusedCell(-1, -1)
                }
            }}
            ref={internalRef}
        >
            {renderInput()}
            {children}
        </div>
    )
})

export const Cell = memo(CellBase)