import React, {forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import {SelectOption, ShotAttributeValueCollection} from "@/utility/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import {ShotSingleSelectAttributeDto} from "../../../../../../../lib/graphql/generated"
import AttributeValueSelect, {
    AttributeValueSelectRef,
    selectShotStyles
} from "@/components/basic/attributeValueSelect/attributeValueSelect"
import {ChevronDown} from "lucide-react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {CellInputRef} from "@/components/app/shotlist/table/cell/valueCell"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"

interface CellSingleSelectInputProps {
    attribute: ShotSingleSelectAttributeDto
    updateAttribute: (attributeId: number, value: ShotAttributeValueCollection) => void
}

const CellSingleSelectInput = forwardRef<CellInputRef, CellSingleSelectInputProps>(
({
    attribute,
    updateAttribute
 }, ref) => {
    const [singleSelectValue, setSingleSelectValue] = useState<SelectOption>();

    const selectInputRef = useRef<AttributeValueSelectRef>(null);

    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)

    useEffect(() => {
        if(attribute.singleSelectValue === null) return
        setSingleSelectValue({
            label: attribute.singleSelectValue?.name || "",
            value: attribute.singleSelectValue?.id || "",
        })
    }, [])

    useImperativeHandle(ref, () => ({
        setFocus: setFocus,
        openMenu: () => {
            selectInputRef.current?.openMenu()
        },
        closeMenu: () => {
            selectInputRef.current?.closeMenu()
        },
        setValue: value => {
            const option = value as SelectOption
            setSingleSelectValue(option)
        }
    }))

    const setFocus = () => {
        selectInputRef.current?.setFocus()
    }

    const updateSingleSelectValue = (value: SelectOption | null) => {
        setSingleSelectValue(value || undefined)
        updateAttribute(attribute.id, {singleSelectValue: value})
    }

    const createOption = async (inputValue: string) => {
        shotlistContext.setSaveState("createShotSingleSelectOption", "saving")

        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation createShotOption($definitionId: BigInteger!, $name: String!) {
                    createShotSelectAttributeOption(createDTO:{
                        attributeDefinitionId: $definitionId,
                        name: $name
                    }){
                        id
                        name
                    }
                }
            `,
            variables: { definitionId: attribute.definition?.id, name: inputValue },
        })

        if(errors) {
            shotlistContext.handleError({
                locationKey: "createShotSingleSelectOption",
                message: "Failed to create shot single select attribute option.",
                cause: errors
            })
            shotlistContext.setSaveState("createShotSingleSelectOption", "error")
            return
        }

        const newOption = {
            label: data.createShotSelectAttributeOption.name,
            value: data.createShotSelectAttributeOption.id
        }

        updateSingleSelectValue(newOption)

        shotlistContext.addShotSelectOption(attribute.definition?.id, newOption)

        shotlistContext.setSaveState("createShotSingleSelectOption", "saved")
    }

    return(
        <div
            className="cellInput"
        >
            <AttributeValueSelect
                definitionId={attribute.definition?.id}
                isMulti={false}
                options={shotlistContext.getShotSelectOption(attribute.definition?.id)}
                loadOptions={shotlistContext.loadShotSelectOptions}
                onChange={(newValue) => updateSingleSelectValue(newValue as SelectOption)}
                onCreate={createOption}
                placeholder={attribute.definition?.name || "Unnamed"}
                value={singleSelectValue}
                shotOrScene={"shot"}
                editAction={() => shotlistContext.openShotlistOptionsDialog({
                    main: ShotlistOptionsDialogPage.attributes,
                    sub: ShotlistOptionsDialogSubPage.shot
                })}
                styles={selectShotStyles}
                ref={selectInputRef}
            />
            {!singleSelectValue &&
                <div className="icon">
                    <ChevronDown size={18} strokeWidth={2}/>
                </div>
            }
        </div>
    )
})

export default CellSingleSelectInput