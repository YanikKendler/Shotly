'use client'

import {
    AnySceneAttribute,
    SceneAttributeValueCollection,
    SceneAttributeValueMultiType,
    SelectOption
} from "@/utility/Types"
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import './sceneAttribute.scss'
import {wuConstants, wuGeneral} from "@yanikkendler/web-utils/dist"
import {ShotlistContext} from "@/context/ShotlistContext"
import {ChevronDown, List, Type} from "lucide-react"
import AttributeValueSelect, {selectSceneStyles} from "@/components/basic/attributeValueSelect/attributeValueSelect"
import {SceneAttributeParser} from "@/utility/AttributeParser"
import {
    SceneMultiSelectAttributeDto,
    SceneSingleSelectAttributeDto,
    SceneTextAttributeDto
} from "../../../../../../lib/graphql/generated"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"

export interface SceneAttributeRef {
    setValue: (value: SceneAttributeValueMultiType) => void
    setReadOnlyValue: (value: string) => void
    setCollaboratorHighlight: (userId: string) => void
    removeCollaboratorHighlight: (userId: string) => void
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

    const client = useApolloClient()

    const shotlistContext = useContext(ShotlistContext)

    const [readOnlyValue, setReadOnlyValue] = useState<string>("")

    const [isBlockedByCollaborator, setIsBlockedByCollaborator] = useState(false)

    useImperativeHandle(ref, () => ({
        //instead of multiype, i should really pass a AnySceneAttribute and then use the setValueFromAttribute
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
        id: attribute.id,
        setCollaboratorHighlight(userId: string){
            if(attribute)
                setIsBlockedByCollaborator(true)
        },
        removeCollaboratorHighlight(userId: string){
            setIsBlockedByCollaborator(false)
        }
    }))

    useEffect(() => {
        if(isReadOnly == false && isBlockedByCollaborator == false) {
            setValueFromAttribute(attribute)
        }
    }, [isReadOnly, isBlockedByCollaborator]);

    useEffect(() => {
        if(!attribute) return;

        if(isReadOnly == true || isBlockedByCollaborator == true) {
            setReadOnlyValue(SceneAttributeParser.toValueString(attribute, false))
        }
    }, [isReadOnly, attribute, isBlockedByCollaborator]);

    useEffect(() => {
        if (!attribute) return;

        setValueFromAttribute(attribute)
    }, []);

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

    const setValueFromAttribute = (attribute: AnySceneAttribute) => {
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
                //specifically setting text value because the p tag does not have a value prop

                const textAttribute = attribute as SceneTextAttributeDto
                if(textValue == "") {
                    setTextValue(textAttribute.textValue || "")

                    if(textInputRef.current)
                        textInputRef.current.innerText = textAttribute.textValue || ""
                }
                else if(textInputRef.current) {
                    textInputRef.current.innerText = textValue
                }
                break
        }
    }

    const createOption = async (inputValue: string) => {
        shotlistContext.setSaveState("createSceneAttributeOption", "saving")

        const result = await client.mutate({
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
            variables: {definitionId: attribute.definition?.id, name: inputValue},
        })

        if (result.errors) {
            shotlistContext.handleError({
                locationKey: "createSceneAttributeOption",
                message: "Failed to create scene attribute option",
                cause: result.errors
            })
            shotlistContext.setSaveState("createSceneAttributeOption", "error")
            return
        }

        const newOption = {
            label: result.data.createSceneSelectAttributeOption.name,
            value: result.data.createSceneSelectAttributeOption.id
        }

        if (attribute.type == "SceneSingleSelectAttributeDTO")
            updateSingleSelectValue(newOption)
        if (attribute.type == "SceneMultiSelectAttributeDTO")
            updateMultiSelectValue([
                ...multiSelectValue || [],
                newOption
            ])

        shotlistContext.addSceneSelectOption(attribute.definition?.id, newOption)
        shotlistContext.setSaveState("createSceneAttributeOption", "saved")
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
        shotlistContext.setSaveState("updateSceneAttributeOption", "saving")

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
            shotlistContext.handleError({
                locationKey: "updateSceneAttributeOption",
                message: "Failed to update scene attribute option",
                cause: errors
            })
            shotlistContext.setSaveState("updateSceneAttributeOption", "error")
            return
        }

        shotlistContext.setSaveState("updateSceneAttributeOption", "saved")
    }

    const debouncedUpdateAttributeValue = useMemo(() => wuGeneral.debounce(updateAttributeValue), []);

    let content: React.JSX.Element = <></>

    if(isReadOnly == true || isBlockedByCollaborator == true) {
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
                            options={shotlistContext.getSceneSelectOption(attribute.definition?.id)}
                            loadOptions={shotlistContext.loadSceneSelectOptions}
                            onChange={(newValue) => updateSingleSelectValue(newValue as SelectOption)}
                            onCreate={createOption}
                            placeholder={attribute.definition?.name || "Unnamed"}
                            value={singleSelectValue}
                            shotOrScene={"scene"}
                            editAction={() => shotlistContext.openShotlistOptionsDialog({
                                main: ShotlistOptionsDialogPage.attributes,
                                sub: ShotlistOptionsDialogSubPage.scene
                            })}
                            styles={selectSceneStyles}
                        ></AttributeValueSelect>
                        {
                            !singleSelectValue &&
                            <div className="icon">
                                <ChevronDown size={18} strokeWidth={2}/>
                            </div>
                        }
                    </>
                )
                break
            case "SceneMultiSelectAttributeDTO":
                content = (
                    <>
                        <AttributeValueSelect
                            definitionId={attribute.definition?.id}
                            isMulti={true}
                            options={shotlistContext.getSceneSelectOption(attribute.definition?.id)}
                            loadOptions={shotlistContext.loadSceneSelectOptions}
                            onChange={(newValue) => updateMultiSelectValue(newValue as SelectOption[])}
                            onCreate={createOption}
                            placeholder={attribute.definition?.name || "Unnamed"}
                            value={multiSelectValue}
                            shotOrScene={"scene"}
                            editAction={() => shotlistContext.openShotlistOptionsDialog({
                                main: ShotlistOptionsDialogPage.attributes,
                                sub: ShotlistOptionsDialogSubPage.scene
                            })}
                            styles={selectSceneStyles}
                        ></AttributeValueSelect>
                        {
                            !multiSelectValue &&
                            <div className="icon">
                                <List size={18} strokeWidth={2}/>
                            </div>
                        }
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

                            {
                                wuConstants.Regex.empty.test(textValue) &&
                                <p className="placeholder">{attribute.definition?.name || "Unnamed"}</p>
                            }
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
        className={`sceneAttribute ${isBlockedByCollaborator && "collaboratorHighlight"}`}
        onFocus={() => {
            shotlistContext.broadCastSceneAttributeSelect(attribute.id)
        }}
        onBlur={() => {
            shotlistContext.broadCastSceneAttributeSelect(-1)
        }}
    >
        {content}
    </div>
})

export default SceneAttribute