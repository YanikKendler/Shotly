import {ForwardRefExoticComponent} from "react"
import {LucideProps, X} from "lucide-react"
import MultiSelect from "@/components/basic/multiSelect/multiSelect"
import {MultiValue} from "react-select"
import {SelectOption} from "@/utility/Types"

export default function ExportFilter({
    Icon,
    name,
    isMulti,
    options,
    value,
    onChange,
    onRemove
}:{
    Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>
    name: string,
    isMulti: boolean,
    options: SelectOption[],
    value: MultiValue<SelectOption>,
    onChange: (value: MultiValue<SelectOption>) => void,
    onRemove: () => void

}) {

    return (
        <div className="setting">
            <div className="left">
                <Icon size={20}/>
                <p>{name}</p>
            </div>

            <p className="combinationInfo">is {(options.length != 1 || value.length == 0)  && "one of"}</p>

            <div className="right">
                <MultiSelect
                    name={name}
                    placeholder={`All ${name}${isMulti ? "" : "s"}`}
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