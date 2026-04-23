import {forwardRef, memo, ReactNode, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import {AnyShotAttribute, ShotAttributeValueCollection, ShotAttributeValueMultiType} from "@/utility/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import CellTextInput from "../input/cellTextInput/cellTextInput"
import CellSingleSelectInput from "../input/cellSingleSelectInput/cellSingleSelectInput"
import CellMultiSelectInput from "../input/cellMultiSelectInput/cellMultiSelectInput"
import {ShotAttributeParser} from "@/utility/AttributeParser"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {
    ShotMultiSelectAttributeDto,
    ShotSingleSelectAttributeDto,
    ShotTextAttributeDto
} from "../../../../../../lib/graphql/generated"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {wuGeneral} from "@yanikkendler/web-utils"
import CellBase from "@/components/app/shotlist/table/cell/cellBase"
import {UserMinimalDTO} from "@/service/useShotlistSync"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"

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
    onValueChange: (value: ShotAttributeValueCollection) => void
}

/**
 * Represents a single cell in the spreadsheet aka a shot attribute
 */
const ValueCellBase = forwardRef<CellRef, CellProps>(({
    attribute,
    row,
    column,
    isReadOnly,
    onValueChange
}, ref)=> {
    const inputRef = useRef<CellInputRef>(null)
    const shotlistContext = useContext(ShotlistContext)
    const client = useApolloClient()

    const [readOnlyValue, setReadOnlyValue] = useState<string>("")

    const [isBlockedByCollaborator, setIsBlockedByCollaborator] = useState<UserMinimalDTO | null>(null)

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
            if(!attribute) return

            const collaborator = shotlistContext.presentCollaborators.get(userId)

            if(collaborator)
                setIsBlockedByCollaborator(collaborator.user)
        },
        removeCollaboratorHighlight(userId: string){
            setIsBlockedByCollaborator(null)
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
            variables: {
                id: attributeId,
                textValue: value.textValue,
                singleSelectValue: value.singleSelectValue?.value,
                multiSelectValue: value.multiSelectValue?.map(m => m.value)
            }
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

        onValueChange(value)
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
                    {/* Needs to be handled via "display" to allow syncing of both readonly and normal value via the element */}
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

                    {
                        isBlockedByCollaborator &&
                        <SimpleTooltip text={isBlockedByCollaborator.name} fontSize={0.8} delay={0}>
                            <span className={"collaboratorName"}>{isBlockedByCollaborator.name.substring(0,1).toUpperCase()}</span>
                        </SimpleTooltip>
                    }
                </>
            }
        </CellBase>
    )
})

export const ValueCell = memo(ValueCellBase)