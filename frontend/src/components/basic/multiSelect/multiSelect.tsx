import Select, {
    ClearIndicatorProps,
    components,
    DropdownIndicatorProps,
    MultiValue,
    MultiValueProps
} from "react-select"
import {reactSelectTheme} from "@/utility/Utils"
import React, {useEffect, useRef, useState} from "react"
import {ChevronDown, X} from "lucide-react"
import {SelectOption} from "@/utility/Types"

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
    //const menuIsOpen = useRef(false)

    useEffect(() => {
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
            /*onMenuOpen={() => menuIsOpen.current = true}
            onMenuClose={() => menuIsOpen.current = false}
            //doesnt really work in dialogs because apparently the event is first handled by the dialog idk
            onKeyDown={e => {
                console.log("keydown", e.key)
                if(e.key == "Escape") {
                    console.log(menuIsOpen.current)
                    if(menuIsOpen.current) {
                        console.log("trying to capute")
                        e.stopPropagation()
                        e.preventDefault()
                    }
                }
            }}*/
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
                    fontSize: ".9rem"
                }),
                menu: (base) => ({
                    ...base,
                    padding: '0.3rem',
                    borderRadius: '0.4rem',
                    border: '2px solid var(--default-interactable-border)',
                    marginBlock: '.1rem',
                    backgroundColor: "var(--contrast)"
                }),
                menuList: (base) => ({
                    ...base,
                    padding: '0rem',
                }),
                option: (base, state) => ({
                    ...base,
                    fontSize: "0.85rem",
                    borderRadius: '0.3rem',
                    backgroundColor: state.isFocused ?
                        state.isSelected ? 'var(--accent-55)' : 'var(--accent)' :
                        state.isSelected ? "var(--transparent-accent-20)" : 'transparent',
                    color: state.isFocused ? "var(--contrast)" : "var(--text)",
                    fontWeight: state.isFocused ? "bold" : "normal",
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
                multiValueRemove: (baseStyles, state) => ({
                    ...baseStyles,
                    color: "var(--text-30)",
                    '&:hover': {
                        color: "var(--bad)",
                        backgroundColor: "var(--bad-90)"
                    },
                })
            }}
        />
    )
}