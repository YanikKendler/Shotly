import {ForwardRefExoticComponent} from "react"
import {Equal, EqualNot, LucideProps, X} from "lucide-react"
import MultiSelect from "@/components/basic/multiSelect/multiSelect"
import {MultiValue} from "react-select"
import {SelectOption} from "@/utility/Types"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import {
    ExportFilterMethod,
    ExportFilterSetting
} from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportTab"
import "./exportFilter.scss"

export default function ExportFilter({
    filter,
    Icon,
    name,
    isMulti,
    options,
    onChange,
    onRemove,
    onToggleMethod
}:{
    filter: ExportFilterSetting
    Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>
    name: string
    isMulti: boolean
    options: SelectOption[]
    onChange: (value: MultiValue<SelectOption>) => void
    onRemove: () => void
    onToggleMethod: () => void
}) {

    const humanReadableMethod = new Map<ExportFilterMethod, string>([
        ["include", `is ${(options.length != 1 || filter.value.length == 0)  && "one of"}`],
        ["exclude", "is not"]
    ])

    return (
        <div className="setting filter">
            <div className="left">
                <Icon size={20}/>
                <p>{name}</p>
            </div>

            <SimpleTooltip content={<><span className="bold">click</span> to toggle</>} delay={800}>
                <button
                    onClick={onToggleMethod}
                    className={"method default"}
                >
                    {humanReadableMethod.get(filter.method)?.toUpperCase() || "UNKNOWN"}
                    <div className="details">
                        { filter.method == "include" ?
                            <Equal size={14}/> :
                            <EqualNot size={14}/>
                        }
                    </div>
                </button>
            </SimpleTooltip>

            <div className="right">
                <MultiSelect
                    name={name}
                    placeholder={`All ${name}${isMulti ? "" : "s"}`}
                    value={filter.value}
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