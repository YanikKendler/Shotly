import React, {useContext, useEffect, useRef, useState} from "react"
import {SelectOption} from "@/util/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import {ShotMultiSelectAttributeDto} from "../../../../../../lib/graphql/generated"
import ShotService from "@/service/ShotService"
import AttributeValueSelect, {selectShotStyles} from "@/components/attributeValueSelect/attributeValueSelect"
import {ChevronDown, List} from "lucide-react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {useSelectRefresh} from "@/context/SelectRefreshContext"

export default function CellMultiSelectInput({
    attribute
}:{
    attribute: ShotMultiSelectAttributeDto
}){
    const [multiSelectValue, setMultiSelectValue] = useState<SelectOption[]>();

    const selectInputRef = useRef(null);

    const client = useApolloClient()
    const shotlistContext = useContext(ShotlistContext)
    const selectRefresh = useSelectRefresh();

    useEffect(() => {
        if(!attribute.multiSelectValue || attribute.multiSelectValue?.length == 0) return

        setMultiSelectValue(attribute.multiSelectValue?.map(
            (option) => {
                return {
                    label: option?.name || "",
                    value: option?.id || "",
                }
            }
        ))
    }, [])

    const updateMultiSelectValue = (value: SelectOption[] | null) => {
        setMultiSelectValue(value || [])
        console.log(value)
        ShotService.updateAttribute(attribute.id, {multiSelectValue: value?.map((option) => Number(option.value))})
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

        updateMultiSelectValue([
            ...multiSelectValue || [], newOption
        ])

        shotlistContext.addShotSelectOption(attribute.definition?.id, newOption)

        selectRefresh.triggerRefresh("shot", attribute.definition?.id)
    }

    return <div className="cellInput">
        <AttributeValueSelect
            definitionId={attribute.definition?.id}
            isMulti={true}
            loadOptions={(searchTerm) => shotlistContext.searchShotSelectOptions(attribute.definition?.id, searchTerm)}
            onChange={(newValue) => updateMultiSelectValue(newValue as SelectOption[])}
            onCreate={createOption}
            placeholder={attribute.definition?.name || "Unnamed"}
            value={multiSelectValue}
            shotOrScene={"shot"}
            editAction={() => shotlistContext.openShotlistOptionsDialog({
                main: "attributes",
                sub: "shot"
            })}
            styles={selectShotStyles}
            ref={selectInputRef}
        ></AttributeValueSelect>
        {!multiSelectValue &&
            <div className="icon">
                <List size={18} strokeWidth={2}/>
            </div>
        }
    </div>
}