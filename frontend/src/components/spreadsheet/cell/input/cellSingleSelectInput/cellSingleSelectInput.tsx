import React, {forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react"
import {SelectOption} from "@/util/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import {ShotSingleSelectAttributeDto} from "../../../../../../lib/graphql/generated"
import ShotService from "@/service/ShotService"
import AttributeValueSelect, {
    AttributeValueSelectRef,
    selectShotStyles
} from "@/components/attributeValueSelect/attributeValueSelect"
import {ChevronDown} from "lucide-react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {useSelectRefresh} from "@/context/SelectRefreshContext"
import {CellInputRef} from "@/components/spreadsheet/cell/cell"

interface CellSingleSelectInputProps {
    attribute: ShotSingleSelectAttributeDto
}

const CellSingleSelectInput = forwardRef<CellInputRef, CellSingleSelectInputProps>(
({
     attribute
 }, ref) => {
    const [singleSelectValue, setSingleSelectValue] = useState<SelectOption>();

    const selectInputRef = useRef<AttributeValueSelectRef>(null);

    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)
    const selectRefresh = useSelectRefresh();

    useEffect(() => {
        if(attribute.singleSelectValue === null) return
        setSingleSelectValue({
            label: attribute.singleSelectValue?.name || "",
            value: attribute.singleSelectValue?.id || "",
        })
    }, [])

    useImperativeHandle(ref, () => ({
        setFocus: setFocus
    }))

    const setFocus = () => {
        selectInputRef.current?.setFocus()
    }

    const updateSingleSelectValue = (value: SelectOption | null) => {
        setSingleSelectValue(value || undefined)
        ShotService.updateAttribute(attribute.id, {singleSelectValue: Number(value?.value)})
    }

    const createOption = async (inputValue: string) => {
        const { data } = await client.mutate({
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

        const newOption = {
            label: data.createShotSelectAttributeOption.name,
            value: data.createShotSelectAttributeOption.id
        }

        updateSingleSelectValue(newOption)

        shotlistContext.addShotSelectOption(attribute.definition?.id, newOption)

        selectRefresh.triggerRefresh("shot", attribute.definition?.id)
    }

    return(
        <div
            className="cellInput"
        >
            <AttributeValueSelect
                definitionId={attribute.definition?.id}
                isMulti={false}
                loadOptions={(searchTerm) => shotlistContext.searchShotSelectOptions(attribute.definition?.id, searchTerm)}
                onChange={(newValue) => updateSingleSelectValue(newValue as SelectOption)}
                onCreate={createOption}
                placeholder={attribute.definition?.name || "Unnamed"}
                value={singleSelectValue}
                shotOrScene={"shot"}
                editAction={() => shotlistContext.openShotlistOptionsDialog({
                    main: "attributes",
                    sub: "shot"
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