import * as React from "react";
import { Select } from "radix-ui";
import "./simpleSelect.scss";
import {ChevronDown, ChevronUp} from "lucide-react";
import {SelectOption} from "@/util/Types"

/**
 * wrapper around radix-ui select intended for simple static UIs like settings pages
 * @param label
 * @param name
 * @param value
 * @param onChange
 * @param options
 * @param fontSize
 * @constructor
 */
export default function SimpleSelect ({
    label,
    name,
    value,
    onChange,
    options,
    fontSize = "1rem"
}:{
    label?: string,
    name: string,
    value?: string,
    onChange: (newValue: string) => void,
    options: SelectOption[],
    fontSize?: string
}) {
    return (
        <div className="simpleSelect">
            { label && <label>{label}</label>}
            <Select.Root onValueChange={onChange} defaultValue={value}>
                <Select.Trigger className="SelectTrigger noClickFx" aria-label="select" style={{fontSize: fontSize}}>
                    <Select.Value placeholder={`Select a ${name}…`}/>
                    <Select.Icon className="SelectIcon">
                        <ChevronDown size={20}/>
                    </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content className="SelectContent" position={"popper"} style={{fontSize: fontSize}}>
                        {
                            !options || options.length === 0 ? <p className="empty">Nothing here :(</p> :
                            options?.map((option) => (
                                <Select.Item
                                    value={option.value}
                                    key={option.value}
                                    className="SelectItem"
                                >
                                    <Select.ItemText>{option.label}</Select.ItemText>
                                </Select.Item>
                            ))
                        }
                    </Select.Content>
                </Select.Portal>
            </Select.Root>
        </div>
    )
}

