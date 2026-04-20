import {forwardRef, memo, ReactNode, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import {AnyShotAttribute, ShotAttributeValueCollection, ShotAttributeValueMultiType} from "@/util/Types"
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
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {wuGeneral} from "@yanikkendler/web-utils"
import CellBase from "@/components/shotlist/table/cell/cellBase"

export interface CellInputRef {
    setFocus: () => void
    openMenu: () => void
    closeMenu: () => void
    setValue: (value: ShotAttributeValueMultiType) => void
}

export interface CellRef {
    setFocus: () => void
    openMenu: () => void
    closeMenu: () => void
    setValue: (value: ShotAttributeValueMultiType) => void
    setReadOnlyValue: (value: string) => void
    id: number
    row: number
    column: number
    setCollaboratorHighlight: (userId: string) => void
    removeCollaboratorHighlight: (userId: string) => void
}

interface CellProps {
    attribute: AnyShotAttribute
    row: number
    column: number
    isReadOnly: boolean
}

/**
 * Represents a single cell in the spreadsheet aka a shot attribute
 */
const ValueCellBase = forwardRef<CellRef, CellProps>(({
    attribute,
    row,
    column,
    isReadOnly
}, ref)=> {
    const inputRef = useRef<CellInputRef>(null)
    const shotlistContext = useContext(ShotlistContext)
    const client = useApolloClient()

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
        openMenu() {
            inputRef.current?.openMenu()
        },
        closeMenu() {
            inputRef.current?.closeMenu()
        },
        setValue(value) {
            inputRef.current?.setValue(value)
        },
        setReadOnlyValue(value: string) {
            setReadOnlyValue(value)
        },
        setCollaboratorHighlight(userId: string){
            if(attribute)
                setIsBlockedByCollaborator(true)
        },
        removeCollaboratorHighlight(userId: string){
            setIsBlockedByCollaborator(false)
        }
    }))

    const updateAttribute = async (attributeId: number, value: ShotAttributeValueCollection) => {
        shotlistContext.setSaveState("updateShotAttribute", "saving")

        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation updateShotAttribute($id: BigInteger!, $textValue: String, $singleSelectValue: BigInteger, $multiSelectValue: [BigInteger]) {
                    updateShotAttribute(editDTO:{
                        id: $id
                        textValue: $textValue
                        singleSelectValue: $singleSelectValue
                        multiSelectValue: $multiSelectValue
                    }){
                        id
                    }
                }
            `,
            variables: {id: attributeId, ...value},
        })
        if (errors) {
            shotlistContext.handleError({
                locationKey: "updateShotAttribute",
                message: "Failed to update shot attribute.",
                cause: errors
            })
            shotlistContext.setSaveState("updateShotAttribute", "error")
            return
        }

        shotlistContext.setSaveState("updateShotAttribute", "saved")
    }

    const debouncedUpdateAttribute = wuGeneral.debounce(updateAttribute)

    const renderInput = () => {
        if(!attribute) return

        switch (attribute.type) {
            case "ShotTextAttributeDTO":
                return <CellTextInput attribute={attribute as ShotTextAttributeDto} updateAttribute={debouncedUpdateAttribute} ref={inputRef} />
            case "ShotSingleSelectAttributeDTO":
                return <CellSingleSelectInput attribute={attribute as ShotSingleSelectAttributeDto} updateAttribute={updateAttribute} ref={inputRef} />
            case "ShotMultiSelectAttributeDTO":
                return <CellMultiSelectInput attribute={attribute as ShotMultiSelectAttributeDto} updateAttribute={updateAttribute} ref={inputRef} />
            default:
                return <p>unknown attribute - please report this as a bug</p>
        }
    }

    const readOnlyValueIsEmpty = !readOnlyValue || wuConstants.Regex.empty.test(readOnlyValue)

    return (
        <CellBase
            className={`default ${isReadOnly && "readOnly"} ${isBlockedByCollaborator && "readOnly collaboratorHighlight"}`}
            onFocus={() => {
                shotlistContext.setFocusedCell(row, column)
            }}
            onBlur={() => {
                shotlistContext.setFocusedCell(-1, -1)
            }}
        >
            { attribute &&
                <>
                    <p
                        className={`readOnlyValue ${readOnlyValueIsEmpty && "empty"}`}
                        style={{display: isReadOnly || isBlockedByCollaborator ? "block" : "none"}}
                    >
                        {readOnlyValueIsEmpty ? "Unset" : readOnlyValue}
                    </p>
                    <div
                        className={"inputWrapper"}
                        style={{display: isReadOnly || isBlockedByCollaborator ? "none" : "block"}}
                    >
                        {renderInput()}
                    </div>
                </>
            }
        </CellBase>
    )
})

export const ValueCell = memo(ValueCellBase)