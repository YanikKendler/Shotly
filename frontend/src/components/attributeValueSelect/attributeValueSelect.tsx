'use client'

import "./attributeValueSelect.scss"
import {SelectOption} from "@/util/Types"
import AsyncCreatableSelect from "react-select/async-creatable"
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from "react"
import {useSelectRefresh} from "@/context/SelectRefreshContext"
import {
    components,
    GroupBase,
    MenuProps,
    MultiValueProps, SelectInstance,
    StylesConfig,
    ValueContainerProps
} from "react-select"
import {Pen} from "lucide-react"
import {reactSelectTheme} from "@/util/Utils"

export const reactSelectBaseStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
    option: (baseStyles, state) => ({
        ...baseStyles,
        cursor: 'pointer',
        borderRadius: ".3rem",
        paddingInline: ".5rem",
        fontSize: ".9rem",
        backgroundColor: state.isFocused ? 'var(--hover-bg-accent-10)' : 'transparent',
        color: "var(--text)",
    }),
    input: (baseStyles) => ({
        ...baseStyles,
        color: "var(--text)",
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        marginTop: 0,
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
        '&:hover': {
            backgroundColor: "var(--hover-bg-bad-10)",
            cursor: 'pointer',
        },
    }),
}

export const selectShotStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
    ...reactSelectBaseStyles,
    control: (baseStyles, state) => ({
        ...baseStyles,
        borderColor: state.isFocused ? 'var(--accent)' : 'transparent',
        backgroundColor: "var(--shot-background)",
        zIndex: state.isFocused ? 100 : 0,
        cursor: 'text',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        '&:hover': {
            borderColor: state.isFocused ? 'var(--accent)' : 'transparent',
        },
        height: "inherit",
    })
}

export const selectSceneStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
    ...reactSelectBaseStyles,
    control: (baseStyles, state) => ({
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
    valueContainer: (baseStyles) => ({
        ...baseStyles,
        padding: "2px .1rem",
        alignItems: "end"
    }),
    multiValue: (baseStyles) => ({
        ...baseStyles,
        marginBottom: "0px",
        borderRadius: "0.3rem",
        backgroundColor: "var(--select-menu-multivalue-bg)",
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        marginTop: "3px",
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,
        cursor: 'pointer',
        borderRadius: ".3rem",
        paddingInline: ".5rem",
        fontSize: ".85rem",
        backgroundColor: state.isFocused ? 'var(--hover-bg-accent-10)' : 'transparent',
        color: "var(--text)",
    }),
}

interface AttributeValueSelectProps {
    definitionId: number,
    value: SelectOption | SelectOption[] | undefined,
    onChange: (newValue: any) => void,
    onCreate: (newValue: any) => void,
    loadOptions: (inputValue: string) => Promise<SelectOption[]>,
    placeholder: string,
    isMulti: boolean
    shotOrScene: "shot" | "scene"
    editAction: () => void
    styles?: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>>
}

export interface AttributeValueSelectRef {
    setFocus: () => void
}

export default forwardRef<AttributeValueSelectRef, AttributeValueSelectProps>(
function AttributeValueSelect(
    {definitionId, value, onChange, onCreate, loadOptions, placeholder, isMulti, shotOrScene, editAction, styles = reactSelectBaseStyles},
    ref
) {
    const { refreshMap } = useSelectRefresh();

    const selectRef = useRef<SelectInstance<any, boolean, any> | null>(null);

    useImperativeHandle(ref, () => ({
        setFocus
    }))

    const setFocus = () => {
        selectRef.current?.focus()
        selectRef.current?.openMenu()
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

    return (
        <AsyncCreatableSelect
            key={`${definitionId}-${refreshMap[`${shotOrScene}-${definitionId}`] || 0}`}
            value={value}
            onChange={onChange}
            isMulti={isMulti}
            isClearable={false}
            onCreateOption={onCreate}
            loadOptions={loadOptions}
            defaultOptions
            placeholder={placeholder || ""}
            openMenuOnFocus={false}
            className="select"
            components={getComponents(isMulti)}
            theme={reactSelectTheme}
            styles={styles}
            menuPlacement="auto"
            ref={selectRef}
/*
            menuIsOpen={true}
*/
        />
    );
}
)
