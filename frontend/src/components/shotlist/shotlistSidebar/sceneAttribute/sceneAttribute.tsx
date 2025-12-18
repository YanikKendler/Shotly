'use client'

import {
    AnySceneAttribute,
    SelectOption,
    SceneAttributeValueCollection, SceneAttributeValueMultiType
} from "@/util/Types"
import React, {
    forwardRef,
    useCallback, useContext,
    useEffect, useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import './sceneAttribute.scss'
import {useSelectRefresh} from "@/context/SelectRefreshContext"
import {wuConstants, wuGeneral, wuText} from "@yanikkendler/web-utils/dist"
import {ShotlistContext} from "@/context/ShotlistContext"
import {ChevronDown, List, Type} from "lucide-react"
import AttributeValueSelect, {selectSceneStyles} from "@/components/inputs/attributeValueSelect/attributeValueSelect"
import {SceneAttributeParser, ShotAttributeParser} from "@/util/AttributeParser"
import {
    SceneMultiSelectAttributeDto,
    SceneSingleSelectAttributeDto,
    SceneTextAttributeDto
} from "../../../../../lib/graphql/generated"

export interface SceneAttributeRef {
    setValue: (value: SceneAttributeValueMultiType) => void
    setReadOnlyValue: (value: string) => void
    id: number
}

export interface SceneAttributeProps {
    attribute: AnySceneAttribute,
    attributeUpdated: (attribute: AnySceneAttribute) => void,
    isReadOnly?: boolean
}

const SceneAttribute = forwardRef<SceneAttributeRef, SceneAttributeProps>(({
    attribute,
    attributeUpdated,
    isReadOnly
}, ref) => {
    const [singleSelectValue, setSingleSelectValue] = useState<SelectOption>();
    const [multiSelectValue, setMultiSelectValue] = useState<SelectOption[]>();
    const [textValue, setTextValue] = useState<string>("");

    const textInputRef = useRef<HTMLParagraphElement>(null);

    const { refreshMap, triggerRefresh } = useSelectRefresh();

    const client = useApolloClient()

    const shotlistContext = useContext(ShotlistContext)

    const [readOnlyValue, setReadOnlyValue] = useState<string>("")

    useImperativeHandle(ref, () => ({
        setValue: (value: SceneAttributeValueMultiType) => {
            switch (attribute.type) {
                case "SceneTextAttributeDTO":
                    setTextValue(value as string)
                    break
                case "SceneSingleSelectAttributeDTO":
                    setSingleSelectValue(value as SelectOption)
                    break
                case "SceneMultiSelectAttributeDTO":
                    setMultiSelectValue(value as SelectOption[])
                    break
            }
        },
        setReadOnlyValue: setReadOnlyValue,
        id: attribute.id
    }))

    useEffect(() => {
        if(isReadOnly == true && attribute){
            setReadOnlyValue(SceneAttributeParser.toValueString(attribute, false))
        }
    }, [isReadOnly, attribute]);

    useEffect(() => {
        if (!attribute) return;

        switch (attribute.type) {
            case "SceneSingleSelectAttributeDTO":
                const single = attribute as SceneSingleSelectAttributeDto
                if(single.singleSelectValue === null) return
                setSingleSelectValue({
                    label: single.singleSelectValue?.name || "",
                    value: single.singleSelectValue?.id || "",
                })
                break
            case "SceneMultiSelectAttributeDTO":
                const multi = attribute as SceneMultiSelectAttributeDto
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
            case "SceneTextAttributeDTO":
                const text = attribute as SceneTextAttributeDto
                if(textValue == "") setTextValue(text.textValue || "")
                break
        }
    }, [attribute]);

    useEffect(() => {
        if (textInputRef.current && textInputRef.current.textContent !== textValue) {
            textInputRef.current.textContent = textValue
        }

        let newValue = { ...attribute, textValue: textValue }
        attributeUpdated(newValue)
    }, [textValue]);

    useEffect(() => {
        let newValue = {
            ...attribute,
            singleSelectValue: {id: singleSelectValue?.value, name: singleSelectValue?.label}
        }
        attributeUpdated(newValue)
    }, [singleSelectValue])

    useEffect(() => {
        let newValue = {
            ...attribute,
            multiSelectValue: multiSelectValue?.map((option) => (
                {id: option.value, name: option.label}
            ))
        }
        attributeUpdated(newValue)
    }, [multiSelectValue])

    const loadOptions = async (inputValue: string) => {
        const { data } = await client.query({
            query: gql`
                query searchSceneSelectAttributeOptions($definitionId: BigInteger!, $searchTerm: String!) {
                    searchSceneSelectAttributeOptions(
                        searchDTO: { sceneAttributeDefinitionId: $definitionId, searchTerm: $searchTerm }
                    ) {
                        id
                        name
                    }
                }
            `,
            variables: { definitionId: attribute.definition?.id, searchTerm: inputValue},
            fetchPolicy: 'no-cache'
        });

        return data.searchSceneSelectAttributeOptions.map((option: any): SelectOption => ({
            value: option.id,
            label: option.name,
        }));
    }

    const createOption = async (inputValue: string) => {
        const { data } = await client.mutate({
            mutation: gql`
                mutation createSceneOption($definitionId: BigInteger!, $name: String!) {
                    createSceneSelectAttributeOption(createDTO:{
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

        if(attribute.type == "SceneSingleSelectAttributeDTO")
            updateSingleSelectValue({
                label: data.createSceneSelectAttributeOption.name,
                value: data.createSceneSelectAttributeOption.id
            })
        if(attribute.type == "SceneMultiSelectAttributeDTO")
            updateMultiSelectValue([
                ...multiSelectValue || [],
                {
                    label: data.createSceneSelectAttributeOption.name,
                    value: data.createSceneSelectAttributeOption.id
                }
            ])

        triggerRefresh("shot", attribute.definition?.id);
    }

    //AI
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

        // Restore selection
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
        debouncedUpdateAttributeValue({ textValue: cleaned });
    }


    const updateSingleSelectValue = (value: SelectOption | null) => {
        setSingleSelectValue(value || undefined)
        updateAttributeValue({singleSelectValue: Number(value?.value)})
    }

    const updateMultiSelectValue = (value: SelectOption[] | null) => {
        setMultiSelectValue(value || [])
        updateAttributeValue({multiSelectValue: value?.map((option) => Number(option.value))})
    }

    const updateAttributeValue = async (value: SceneAttributeValueCollection) => {
        const {data, errors} = await client.mutate({
            mutation : gql`
                mutation updateSceneAttribute($id: BigInteger!, $textValue: String, $singleSelectValue: BigInteger, $multiSelectValue: [BigInteger]) {
                    updateSceneAttribute(editDTO:{
                        id: $id
                        textValue: $textValue
                        singleSelectValue: $singleSelectValue
                        multiSelectValue: $multiSelectValue
                    }){
                        id
                    }
                }
            `,
            variables: {id: attribute.id, ...value},
        });
        if(errors) {
            console.error(errors)
        }
    }

    const debouncedUpdateAttributeValue = useMemo(() => wuGeneral.debounce(updateAttributeValue), []);

    let content: React.JSX.Element = <></>


    if(isReadOnly == true) {
        if(!readOnlyValue || wuConstants.Regex.empty.test(readOnlyValue))
            content = <p className="readOnlyValue empty">Unset</p>
        else
            content = <p className="readOnlyValue">{readOnlyValue}</p>
    }
    else
    {
        switch (attribute.type) {
            case "SceneSingleSelectAttributeDTO":
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
                            shotOrScene={"scene"}
                            editAction={() => shotlistContext.openShotlistOptionsDialog({
                                main: "attributes",
                                sub: "scene"
                            })}
                            styles={selectSceneStyles}
                        ></AttributeValueSelect>
                        <div className="icon">
                            <ChevronDown size={18} strokeWidth={2}/>
                        </div>
                    </>
                )
                break
            case "SceneMultiSelectAttributeDTO":
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
                            shotOrScene={"scene"}
                            editAction={() => shotlistContext.openShotlistOptionsDialog({
                                main: "attributes",
                                sub: "scene"
                            })}
                            styles={selectSceneStyles}
                        ></AttributeValueSelect>
                        <div className="icon">
                            <List size={18} strokeWidth={2}/>
                        </div>
                    </>
                )
                break
            case "SceneTextAttributeDTO":
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

    return <div className="sceneAttribute">{content}</div>
})

export default SceneAttribute