import {wuConstants, wuGeneral} from "@yanikkendler/web-utils"
import {Type} from "lucide-react"
import React, {useEffect, useMemo, useRef} from "react"
import {ShotTextAttributeDto} from "../../../../../../lib/graphql/generated"
import ShotService from "@/service/ShotService"

/**
 * Represents specifically a text input in a spreadsheet cell handles updating the value in the backend
 * @param attribute the text attribute of this cell
 * @constructor
 */
export default function CellTextInput({
    attribute
}:{
    attribute: ShotTextAttributeDto
}){
    const [textValue, setTextValue]  = React.useState<string>("")
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if(wuConstants.Regex.empty.test(textValue)) setTextValue(attribute.textValue || "")
    }, [attribute])

    useEffect(() => {
        if (inputRef.current && inputRef.current.textContent !== textValue) {
            inputRef.current.textContent = textValue
        }
    }, [textValue])

    const setFocus = () => {
        inputRef.current?.focus()
    }

    const updateTextValue = () => {
        if (!inputRef.current) return

        const el = inputRef.current

        // Get current selection
        const selection = window.getSelection()
        const range = selection?.getRangeAt(0)

        const preCaretRange = range?.cloneRange()
        preCaretRange?.selectNodeContents(el)
        preCaretRange?.setEnd(range!.endContainer, range!.endOffset)
        const caretOffset = preCaretRange?.toString().length ?? 0

        // Remove line breaks
        let cleaned = el.innerText.replace(/[\r\n]+/g, " ")
        el.innerText = cleaned

        // Restore caret position
        const newRange = document.createRange()
        const textNode = el.firstChild
        let offset = Math.min(caretOffset, cleaned.length)

        if (textNode) {
            newRange.setStart(textNode, offset)
            newRange.setEnd(textNode, offset)
            selection?.removeAllRanges()
            selection?.addRange(newRange)
        }

        setTextValue(cleaned)
        ShotService.debouncedUpdateAttribute(attribute.id, { textValue: cleaned })
    }

    return (
        <div
            className="cellInput"
            onClick={setFocus}
        >
            <p
                className={"text"}
                ref={inputRef}
                contentEditable={true}
                onInput={updateTextValue}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                    }
                }}
            />

            {
                wuConstants.Regex.empty.test(textValue) &&
                <>
                    <p className="placeholder">{attribute.definition?.name || "Unnamed"}</p>
                    <div className="icon">
                        <Type size={18} strokeWidth={2}/>
                    </div>
                </>
            }
        </div>
    )
}