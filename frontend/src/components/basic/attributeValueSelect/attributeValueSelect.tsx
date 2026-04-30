'use client'

import "./attributeValueSelect.scss"
import {SelectOption} from "@/utility/Types"
import AsyncCreatableSelect from "react-select/async-creatable"
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react"
import {
    components,
    GroupBase,
    MenuProps,
    MultiValueProps, SelectInstance,
    StylesConfig,
    ValueContainerProps
} from "react-select"
import {Pen} from "lucide-react"
import Utils, {reactSelectTheme} from "@/utility/Utils"
import CreatableSelect from "react-select/creatable"

export const reactSelectBaseStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
    control: (baseStyles) => ({
        ...baseStyles,
        minWidth: 0,
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,
        cursor: 'pointer',
        borderRadius: ".3rem",
        paddingInline: ".5rem",
        backgroundColor: state.isFocused ?
            state.isSelected ? 'var(--accent-55)' : 'var(--accent)' :
            state.isSelected ? "var(--transparent-accent-20)" : 'transparent',
        color: state.isFocused ? "var(--contrast)" : "var(--text)",
        fontWeight: state.isFocused ? "bold" : "normal",
        fontSize: "0.85rem",
        width: "fit-content",
        minWidth: "100%",
        maxWidth: "15rem",
        overflow: "hidden",
        textOverflow: "ellipsis",
    }),
    input: (baseStyles) => ({
        ...baseStyles,
        color: "var(--text)",
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        marginTop: 0,
        borderBottomLeftRadius: ".6rem",
        borderBottomRightRadius: ".6rem",
        animation: "selectDropdownShow 150ms ease-out"
    }),
    singleValue: (baseStyles) => ({
        ...baseStyles,
        color: "var(--text)",
    }),
    valueContainer: (baseStyles, props) => ({
        ...baseStyles,
        paddingInline: "3px",
        paddingBlock: ".1rem"
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
    multiValueRemove: (baseStyles) => ({
        ...baseStyles,
        transition: 'background-color 0.1s, color 0.1s',
        color: "var(--text-30)",
        '&:hover': {
            color: "var(--bad-20)",
            backgroundColor: "var(--transparent-bad-20)",
            cursor: "default"
        },
    }),
    placeholder: base => ({
        ...base,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        maxWidth: "calc(100% - 2rem)"
    }),
    noOptionsMessage: base => ({
        ...base,
        fontSize: ".85rem"
    })
}

export const selectShotStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
    ...reactSelectBaseStyles,
    control: (baseStyles, state) => ({
        ...baseStyles,
        border: "none",
        outline: "none",
        boxShadow: "none",
        backgroundColor: "var(--cell-background)",
        zIndex: state.isFocused ? 100 : 0,
        cursor: 'text',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        height: "inherit",
        minHeight: 0,
        fontSize: "calc(.9rem * var(--shotlist-scale))"
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,
        cursor: 'pointer',
        borderRadius: "calc(.3rem * var(--shotlist-scale))",
        paddingInline: "calc(0.5rem * var(--shotlist-scale))",
        backgroundColor: state.isFocused ?
            state.isSelected ? 'var(--accent-55)' : 'var(--accent)' :
            state.isSelected ? "var(--transparent-accent-20)" : 'transparent',
        color: state.isFocused ? "var(--contrast)" : "var(--text)",
        fontWeight: state.isFocused ? "bold" : "normal",
        fontSize: "calc(0.85rem * var(--shotlist-scale))",
        width: "fit-content",
        minWidth: "100%",
        maxWidth: "calc(0.15rem * var(--shotlist-scale))",
        overflow: "hidden",
        textOverflow: "ellipsis",
    }),
    noOptionsMessage: base => ({
        ...base,
        fontSize: "calc(0.85rem * var(--shotlist-scale))",
    })
}

export const selectSceneStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
    ...reactSelectBaseStyles,
    control: (baseStyles, state) => ({
        ...reactSelectBaseStyles.control,
        ...baseStyles,
        border: "none",
        boxShadow: "none",
        outline: "none",
        backgroundColor: "transparent",
        zIndex: state.isFocused ? 100 : 0,
        cursor: 'text',
        borderRadius: "0",
        fontSize: ".95rem",
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        marginTop: "3px",
        borderBottomLeftRadius: ".6rem",
        borderBottomRightRadius: ".6rem",
        animation: "selectDropdownShow 150ms ease-out"
    })
}

interface AttributeValueSelectProps {
    definitionId: number,
    value: SelectOption | SelectOption[] | undefined,
    onChange: (newValue: any) => void,
    onCreate: (newValue: any) => Promise<void>,
    options: SelectOption[],
    loadOptions: (definitionId: number) => Promise<void>,
    placeholder: string,
    isMulti: boolean
    shotOrScene: "shot" | "scene"
    editAction: () => void
    styles?: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>>
}

export interface AttributeValueSelectRef {
    setFocus: () => void
    openMenu: () => void
    closeMenu: () => void
}

export default forwardRef<AttributeValueSelectRef, AttributeValueSelectProps>(
function AttributeValueSelect({
    definitionId,
    value,
    onChange,
    onCreate,
    options,
    loadOptions,
    placeholder,
    isMulti,
    shotOrScene,
    editAction,
    styles = reactSelectBaseStyles
}, ref) {
    const selectRef = useRef<SelectInstance<any, boolean, any> | null>(null);
    const [isLoading, setIsLoading] = useState(true)
    const [menuIsOpen, setMenuIsOpen] = useState(false)

    useImperativeHandle(ref, () => ({
        setFocus,
        openMenu,
        closeMenu
    }))

    useEffect(() => {
        setIsLoading(true)
        loadOptions(definitionId).then(() => {
            setIsLoading(false)
        })
    }, [definitionId])

    const setFocus = () => {
        selectRef.current?.focus()
    }

    const openMenu = () => {
        selectRef.current?.openMenu("first")
    }

    const closeMenu = () => {
        setMenuIsOpen(false)
    }

    const handleCreate = (inputValue: string) => {
        setIsLoading(true)
        onCreate(inputValue).then(() => {
            setIsLoading(false)
        })
    }

    const CustomSelectMenu = <
        Option,
        IsMulti extends boolean = false
    >(
        props: MenuProps<Option, IsMulti, GroupBase<Option>>
    ) => {
        return (
            <components.Menu {...props}>
                <div className="customSelectMenu" style={{backgroundColor: shotOrScene == "shot" ? "var(--select-menu-bg)" : "var(--select-menu-scene-bg)"}}>
                    <div className="content" style={{padding: shotOrScene == "shot" ? ".3rem" : ".2rem"}}>
                        {props.children}
                    </div>
                    <div className="bottom" onClick={editAction}>
                        <p>Edit Attributes</p>
                        <Pen size={16} strokeWidth={2} />
                    </div>
                </div>
            </components.Menu>
        )
    }

    const CustomMultiValue = (
        props: MultiValueProps<SelectOption, true>
    ) => {
        if (!props.selectProps.menuIsOpen) return <p style={{display: "inline", margin: "2px"}}>{props.data.label}</p>;
        return <components.MultiValue {...props}  children={props.children}/>;
    };

    const CustomValueContainer = useCallback((
        props: ValueContainerProps<SelectOption, true>
    ) => {
        const { children, innerProps, selectProps, getValue } = props;
        const selected = getValue()

        let childrenArray = React.Children.toArray(children);
        let options = childrenArray.slice(0, -1); // all selected items
        let input = childrenArray.at(-1);

        if(!selectProps.menuIsOpen && selected.length > 0) {
            options = options.map((child, index) => {
                if (index > 0 && index < selected.length) {
                    return <div style={{display: "inline"}} key={index}><span>,</span> {child}</div>
                }
                return child
            })
        }

        return (
            <components.ValueContainer {...props}>
                {options}
                {input}
            </components.ValueContainer>
        )
    }, []);

    const getComponents = (isMulti: boolean) => {
        if(isMulti)
            return {
                Menu: CustomSelectMenu,
                MultiValue: CustomMultiValue,
                ValueContainer: CustomValueContainer,
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
            }
        else
            return {
                Menu: CustomSelectMenu,
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
            }
    }

    const handleMenuOpen = () => {
        setMenuIsOpen(true)
    }

    const handleMenuClose = () => {
        setMenuIsOpen(false)
    }

    let selectValue = undefined

    if(value){
        if(isMulti){
            selectValue = (value as SelectOption[]).map(Utils.optionToUnnamedIfEmpty)
        }
        else{
            selectValue = Utils.optionToUnnamedIfEmpty(value as SelectOption)
        }
    }

    return (
        <CreatableSelect
            menuIsOpen={menuIsOpen}
            value={selectValue}
            onChange={onChange}
            onMenuOpen={handleMenuOpen}
            onMenuClose={handleMenuClose}
            isMulti={isMulti}
            isClearable={false}
            onCreateOption={handleCreate}
            options={options.map(Utils.optionToUnnamedIfEmpty)}
            isLoading={isLoading}
            placeholder={placeholder || ""}
            openMenuOnFocus={false}
            blurInputOnSelect={false}
            className="select"
            components={getComponents(isMulti)}
            theme={reactSelectTheme}
            styles={styles}
            menuPlacement="auto"
            ref={selectRef}
            onKeyDown={e => {
                if (menuIsOpen) {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.stopPropagation();
                    }
                } else {
                    if (e.key === "Enter") {
                        openMenu();
                        e.preventDefault();
                    }
                }
            }}
        />
    );
}
)
