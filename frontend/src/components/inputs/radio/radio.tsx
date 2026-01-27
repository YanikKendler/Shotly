import { RadioGroup } from "radix-ui";
import {SelectOption} from "@/util/Types"
import "./radio.scss"
import TextField from "@/components/inputs/textField/textField"
import {useEffect, useState} from "react"

export interface RadioResult{
    value: string | null
    otherText: string
}

export default function Radio({
    options,
    value,
    onValueChange,
    textOption
}:{
    options: SelectOption[]
    value: string | null,
    onValueChange: (value: RadioResult) => void,
    textOption?: boolean
}){
    const [otherText, setOtherText] = useState("")

    useEffect(() => {
        onValueChange({
            value: value,
            otherText: otherText
        })
    }, [otherText])

    const handleRadioSelect = (selectedValue: string) => {
        onValueChange({
            value: selectedValue,
            otherText: otherText
        })
    }

    return <RadioGroup.Root
        className="radio"
        value={value || null}
        onValueChange={handleRadioSelect}
        aria-label="View density"
    >
        {
            options.map((option, index) =>
                <RadioGroup.Item className="radioItem" value={option.value} key={index}>
                    <div className="radioCheck">
                        <RadioGroup.Indicator className="checkIndicator"/>
                    </div>
                    <p>{option.label}</p>
                </RadioGroup.Item>
            )
        }
        {
            textOption &&
            <RadioGroup.Item className="radioItem" value={"other"}>
                <div className="radioCheck">
                    <RadioGroup.Indicator className="checkIndicator"/>
                </div>
                <p>Other</p>
            </RadioGroup.Item>
        }

        <TextField
            visible={value == "other"}
            value={otherText}
            valueChange={setOtherText}
            placeholder={"Tell me more..."}
        />
    </RadioGroup.Root>
}