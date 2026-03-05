'use client'

import "./attributeValueSelect.scss"
import {SelectOption} from "@/util/Types"
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
import Utils, {reactSelectTheme} from "@/util/Utils"
import CreatableSelect from "react-select/creatable"
import {wuConstants} from "@yanikkendler/web-utils/dist"

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
    }),
    input: (baseStyles) => ({
        ...baseStyles,
        color: "var(--text)",
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        marginTop: 0,
        borderBottomLeftRadius: ".6rem",
        borderBottomRightRadius: ".6rem"
    }),
    singleValue: (baseStyles) => ({
        ...baseStyles,
        color: "var(--text)",
    }),
    valueContainer: (baseStyles) => ({
        ...baseStyles,
        padding: "2px .1rem"
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
            color: "var(--bad)",
            backgroundColor: "var(--bad-80)",
            cursor: "default"
        },
    }),
    placeholder: base => ({
        ...base,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        maxWidth: "calc(100% - 2rem)",
    })
}

export const selectShotStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
    ...reactSelectBaseStyles,
    control: (baseStyles, state) => ({
        ...reactSelectBaseStyles.control,
        ...baseStyles,
        border: "none",
        outline: "none",
        boxShadow: "none",
        backgroundColor: "var(--cell-background)",
        zIndex: state.isFocused ? 100 : 0,
        cursor: 'text',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        height: "inherit",
        minHeight: 0
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
    const menuIsOpen = useRef(false)

    useImperativeHandle(ref, () => ({
        setFocus,
        openMenu
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
        selectRef.current?.blur()
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
        if (!props.selectProps.menuIsOpen) return <p style={{display: "inline"}}>{props.data.label}</p>;
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
        menuIsOpen.current = true
    }

    const handleMenuClose = () => {
        menuIsOpen.current = false
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
            /*menuIsOpen={true}*/
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
                if (menuIsOpen.current) {
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
