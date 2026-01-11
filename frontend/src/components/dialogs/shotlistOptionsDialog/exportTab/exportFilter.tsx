import {ShotAttributeDefinitionParser} from "@/util/AttributeParser"
import {Component, ForwardRefExoticComponent} from "react"
import {LucideProps, X} from "lucide-react"
import {ShotSelectAttributeOptionDefinition} from "../../../../../lib/graphql/generated"
import MultiSelect from "@/components/inputs/multiSelect/multiSelect"
import {MultiValue} from "react-select"
import {SelectOption} from "@/util/Types"

export default function ExportFilter({
    Icon,
    name,
    options,
    value,
    onChange,
    onRemove
}:{
    Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>
    name: string,
    options: SelectOption[],
    value: MultiValue<SelectOption>,
    onChange: (value: MultiValue<SelectOption>) => void,
    onRemove: () => void

}) {

    return (
        <div className="filter">
            <div className="left">
                <Icon size={22}/>
                <p>{name}</p>
            </div>

            <p className="combinationInfo">is {(options.length != 1 || value.length == 0)  && "one of"}</p>

            <div className="right">
                <MultiSelect
                    name={name}
                    placeholder={"All " + name + "s"}
                    value={value}
                    options={options}
                    onChange={onChange}
                    sorted={true}
                    minWidth={"20rem"}
                />

                <button
                    className="remove bad"
                    onClick={onRemove}
                >
                    <X size={18}/>
                </button>
            </div>
        </div>
    )
}