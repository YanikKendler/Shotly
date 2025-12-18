'use client'

import {AnyShotAttribute, ShotAttributeValueCollection, SelectOption} from "@/util/Types"
import React, {
    forwardRef,
    useContext,
    useEffect, useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import './shotAttribute.scss'
import {useSelectRefresh} from "@/context/SelectRefreshContext"
import {wuConstants, wuGeneral, wuText} from "@yanikkendler/web-utils/dist"
import ShotService from "@/service/ShotService"
import {ShotlistContext} from "@/context/ShotlistContext"
import {ChevronDown, List, Type} from "lucide-react"
import AttributeValueSelect, {
    AttributeValueSelectRef,
    selectShotStyles
} from "@/components/inputs/attributeValueSelect/attributeValueSelect"
import {SceneAttributeParser, ShotAttributeParser} from "@/util/AttributeParser"
import {
    ShotMultiSelectAttributeDto,
    ShotSingleSelectAttributeDto,
    ShotTextAttributeDto
} from "../../../../lib/graphql/generated"

export interface ShotAttributeProps {
    attribute: AnyShotAttribute
    className?: string
    readOnly: boolean
    getNeighbourAt: (index: number) => ShotAttributeRef
    onFocus: () => void
    row: number
    column: number
}

export interface ShotAttributeRef {
    row: number
    column: number
    setFocus: () => void
    getNeighbourAt: (index: number) => ShotAttributeRef
}

const ShotAttribute = forwardRef<ShotAttributeRef, ShotAttributeProps>(
({ attribute, className, readOnly, getNeighbourAt, onFocus, row, column }: ShotAttributeProps, ref) =>
{
    const [singleSelectValue, setSingleSelectValue] = useState<SelectOption>();
    const [multiSelectValue, setMultiSelectValue] = useState<SelectOption[]>();
    const [textValue, setTextValue] = useState<string>("");

    const textInputRef = useRef<HTMLParagraphElement | null>(null);
    const selectInputRef = useRef<AttributeValueSelectRef>(null)

    const { refreshMap, triggerRefresh } = useSelectRefresh();

    const client = useApolloClient()

    const shotlistContext = useContext(ShotlistContext)

    useImperativeHandle(ref, () => ({
        row: row,
        column: column,
        setFocus: setFocus,
        getNeighbourAt: getNeighbourAt
    }))

    useEffect(() => {
        if (!attribute) return;

        switch (attribute.type) {
            case "ShotSingleSelectAttributeDTO":
                const single = attribute as ShotSingleSelectAttributeDto
                if(single.singleSelectValue === null) return
                setSingleSelectValue({
                    label: single.singleSelectValue?.name || "",
                    value: single.singleSelectValue?.id || "",
                })
                break
            case "ShotMultiSelectAttributeDTO":
                const multi = attribute as ShotMultiSelectAttributeDto
                if(multi.multiSelectValue === null || multi.multiSelectValue?.length == 0) return
                setMultiSelectValue(multi.multiSelectValue?.map(
                    (option) => {
                        return {
                            label: option?.name || "",
                            value: option?.id || "",
                        }
                    }
                ))
                break
            case "ShotTextAttributeDTO":
                const text = attribute as ShotTextAttributeDto
                if(textValue == "") setTextValue(text.textValue || "")
                break
        }
    }, []);

    useEffect(() => {
        if (textInputRef.current && textInputRef.current.textContent !== textValue) {
            textInputRef.current.textContent = textValue;
        }
    }, [textValue]);

    const setFocus = () =>{
        if(attribute.type == "ShotTextAttributeDTO"){
            textInputRef.current?.focus()
        }
        else{
            console.log(selectInputRef.current)
            selectInputRef.current?.setFocus()
        }
    }

    const loadOptions = async (inputValue: string) => {
        //TODO optimize this, especially when dragging, some sort of cashing is needed
        const { data } = await client.query({
            query: gql`
                query searchShotSelectAttributeOptions($definitionId: BigInteger!, $searchTerm: String!) {
                    searchShotSelectAttributeOptions(
                        searchDTO: { shotAttributeDefinitionId: $definitionId, searchTerm: $searchTerm }
                    ) {
                        id
                        name
                    }
                }
            `,
            variables: { definitionId: attribute.definition?.id, searchTerm: inputValue},
            fetchPolicy: 'no-cache'
        });

        return data.searchShotSelectAttributeOptions.map((option: any): SelectOption => ({
            value: option.id,
            label: option.name,
        }));
    }

    const createOption = async (inputValue: string) => {
        const { data } = await client.mutate({
            mutation: gql`
                mutation createShotOption($definitionId: BigInteger!, $name: String!) {
                    createShotSelectAttributeOption(createDTO:{
                        attributeDefinitionId: $definitionId,
                        name: $name
                    }){
                        id
                        name
                    }
                }
            `,
            variables: { definitionId: attribute.definition?.id, name: inputValue },
        });

        if(attribute.type == "ShotMultiSelectAttributeDTO")
            updateMultiSelectValue([
                ...multiSelectValue || [],
                {
                    label: data.createShotSelectAttributeOption.name,
                    value: data.createShotSelectAttributeOption.id
                }
            ])

        if(attribute.type == "ShotSingleSelectAttributeDTO")
            updateSingleSelectValue({
                label: data.createShotSelectAttributeOption.name,
                value: data.createShotSelectAttributeOption.id
            })

        triggerRefresh("shot", attribute.definition?.id);
    }

    const updateTextValue = () => {
        if (!textInputRef.current) return;

        const el = textInputRef.current;

        // Get current selection
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        const preCaretRange = range?.cloneRange();
        preCaretRange?.selectNodeContents(el);
        preCaretRange?.setEnd(range!.endContainer, range!.endOffset);
        const caretOffset = preCaretRange?.toString().length ?? 0;

        // Clean text
        let cleaned = el.innerText.replace(/[\r\n]+/g, " ");
        el.innerText = cleaned;

        // Restore caret position
        const newRange = document.createRange();
        const textNode = el.firstChild;
        let offset = Math.min(caretOffset, cleaned.length);

        if (textNode) {
            newRange.setStart(textNode, offset);
            newRange.setEnd(textNode, offset);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
        }

        setTextValue(cleaned);
        debouncedUpdateAttributeValue(attribute.id, { textValue: cleaned });
    };

    const updateSingleSelectValue = (value: SelectOption | null) => {
        setSingleSelectValue(value || undefined)
        ShotService.updateAttribute(attribute.id, {singleSelectValue: Number(value?.value)})
    }

    const updateMultiSelectValue = (value: SelectOption[] | null) => {
        setMultiSelectValue(value || [])
        ShotService.updateAttribute(attribute.id, {multiSelectValue: value?.map((option) => Number(option.value))})
    }

    const debouncedUpdateAttributeValue = useMemo(() => wuGeneral.debounce(ShotService.updateAttribute), []);

    let content: React.JSX.Element = <></>

    if(readOnly)
        content = <p className={"readOnlyValue"}>{ShotAttributeParser.toValueString(attribute, false)}</p>
    else {
        switch (attribute.type) {
            case "ShotSingleSelectAttributeDTO":
                content = (
                    <>
                        <AttributeValueSelect
                            definitionId={attribute.definition?.id}
                            isMulti={false}
                            loadOptions={loadOptions}
                            onChange={(newValue) => updateSingleSelectValue(newValue as SelectOption)}
                            onCreate={createOption}
                            placeholder={attribute.definition?.name || "Unnamed"}
                            value={singleSelectValue}
                            shotOrScene={"shot"}
                            editAction={() => shotlistContext.openShotlistOptionsDialog({
                                main: "attributes",
                                sub: "shot"
                            })}
                            styles={selectShotStyles}
                            ref={selectInputRef}
                        ></AttributeValueSelect>
                        {!singleSelectValue &&
                            <div className="icon">
                                <ChevronDown size={18} strokeWidth={2}/>
                            </div>
                        }
                    </>
                )
                break
            case "ShotMultiSelectAttributeDTO":
                content = (
                    <>
                        <AttributeValueSelect
                            definitionId={attribute.definition?.id}
                            isMulti={true}
                            loadOptions={loadOptions}
                            onChange={(newValue) => updateMultiSelectValue(newValue as SelectOption[])}
                            onCreate={createOption}
                            placeholder={attribute.definition?.name || "Unnamed"}
                            value={multiSelectValue}
                            shotOrScene={"shot"}
                            editAction={() => shotlistContext.openShotlistOptionsDialog({
                                main: "attributes",
                                sub: "shot"
                            })}
                            styles={selectShotStyles}
                            ref={selectInputRef}
                        ></AttributeValueSelect>
                        {(!multiSelectValue || multiSelectValue?.length == 0) &&
                            <div className="icon">
                                <List size={18} strokeWidth={2}/>
                            </div>
                        }
                    </>
                )
                break
            case "ShotTextAttributeDTO":
                content = (
                    <>
                        <div className="input" onClick={(e) => {
                            ((e.target as HTMLElement).querySelector(".text") as HTMLElement)?.focus()
                        }}>
                            <p
                                className={"text"}
                                ref={textInputRef}
                                contentEditable={true}
                                onInput={updateTextValue}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                            />

                            {wuConstants.Regex.empty.test(textValue) &&
                                <p className="placeholder">{attribute.definition?.name || "Unnamed"}</p>}
                        </div>
                        {wuConstants.Regex.empty.test(textValue) && (
                            <div className="icon">
                                <Type size={18} strokeWidth={2}/>
                            </div>
                        )}
                    </>
                )
                break
        }
    }

    return <div
        className={`shotAttribute ${className || ""}`}
        onFocus={onFocus}
    >
        {content}
    </div>
})

export default React.memo(ShotAttribute);