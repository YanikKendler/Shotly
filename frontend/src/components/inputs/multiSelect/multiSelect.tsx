import Select, {
    ClearIndicatorProps,
    components,
    DropdownIndicatorProps,
    MultiValue,
    MultiValueProps
} from "react-select"
import {reactSelectTheme} from "@/util/Utils"
import React, {useEffect, useState} from "react"
import {ChevronDown, X} from "lucide-react"
import {SelectOption} from "@/util/Types"

const CustomDropdownIndicator = (
    props: DropdownIndicatorProps<SelectOption, true>
) => {
    return <components.DropdownIndicator {...props} children={<ChevronDown size={20}/>}/>;
};

const CustomClearIndicator = (
    props: ClearIndicatorProps<SelectOption, true>
) => {
    return <components.ClearIndicator {...props} children={<X size={18}/>}/>;
}

/**
 * Wrapper around react-select intended for simple static UIs like settings pages
 * @param name
 * @param placeholder
 * @param options
 * @param onChange
 * @param minWidth
 * @param sorted
 * @constructor
 */
export default function MultiSelect(
    {
        name,
        placeholder = "Select...",
        options,
        onChange,
        minWidth = '8rem',
        sorted = false,
        value
    }: {
        name: string
        placeholder?: string
        options: SelectOption[]
        onChange: (newValue: MultiValue<SelectOption>)=>void
        minWidth?: string
        sorted?: boolean
        value?: MultiValue<SelectOption>
    }
) {
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<SelectOption>>([]);
    const [actualMinWidth, setActualMinWidth] = useState<string>(minWidth);

    useEffect(() => {
        console.log("minWidth changed to: ", minWidth, "window.innerWidth: ", window.innerWidth)
        if(window.innerWidth < 600)
            setActualMinWidth("0")
        else
            setActualMinWidth(minWidth)
    }, [minWidth])

    useEffect(() => {
        if(!value) return

        setSelectedOptions(value || [])
    }, [value]);

    const handleChange = (selectedOptions: MultiValue<SelectOption>) => {
        let newOptions= selectedOptions.values().toArray()
        if(sorted)
            newOptions = selectedOptions.values().toArray().sort((a, b) =>
                a.value.localeCompare(b.value)
            )
        setSelectedOptions(newOptions)
        onChange(newOptions)
    }


    return (
        <Select
            isMulti
            name={name}
            value={selectedOptions}
            options={options}
            onChange={handleChange}
            theme={reactSelectTheme}
            closeMenuOnSelect={false}
            placeholder={placeholder}
            components={{
                DropdownIndicator: CustomDropdownIndicator,
                ClearIndicator: CustomClearIndicator,
                IndicatorSeparator: () => null,
            }}
            styles={{
                clearIndicator: (base) => ({
                    ...base,
                    cursor: 'pointer',
                }),
                dropdownIndicator: (base) => ({
                    ...base,
                    cursor: 'pointer',
                    color: "var(--text-50)",
                }),
                control: (base, state) => ({
                    ...base,
                    borderRadius: '0.4rem',
                    minWidth: actualMinWidth,
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                    borderWidth: '.15rem',
                    borderStyle: 'solid',
                    borderColor: state.isFocused ? 'var(--accent)' : 'var(--default-interactable-border)',
                    '&:hover': {
                        borderColor: state.isFocused ? 'var(--accent)' : 'var(--default-interactable-border-hover)',
                    },
                    outline: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                }),
                menu: (base) => ({
                    ...base,
                    padding: '0.3rem',
                    borderRadius: '0.4rem',
                    border: '.15rem solid var(--default-interactable-border)',
                    marginBlock: '.1rem',
                    backgroundColor: "var(--contrast)"
                }),
                menuList: (base) => ({
                    ...base,
                    padding: '0rem',
                }),
                option: (base, state) => ({
                    ...base,
                    borderRadius: '0.3rem',
                    backgroundColor: state.isSelected
                        ? 'var(--hover-bg-accent-10)'
                        : state.isFocused
                            ? 'var(--hover-bg-10)'
                            : 'transparent',
                }),
                multiValue: (baseStyles) => ({
                    ...baseStyles,
                    borderRadius: "0.3rem",
                    backgroundColor: "var(--select-menu-multivalue-bg)",
                }),
                multiValueLabel: (baseStyles) => ({
                    ...baseStyles,
                    color: "var(--text)",
                }),
            }}
        />
    )
}