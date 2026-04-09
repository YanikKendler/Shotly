import {wuConstants, wuGeneral} from "@yanikkendler/web-utils"
import {Type} from "lucide-react"
import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef} from "react"
import {ShotTextAttributeDto} from "../../../../../../lib/graphql/generated"
import {CellInputRef} from "@/components/shotlist/table/cell/cell"
import {ShotAttributeValueCollection} from "@/util/Types"

interface CellTextInputProps {
    attribute: ShotTextAttributeDto
    updateAttribute: (attributeId: number, value: ShotAttributeValueCollection) => void
}

/**
 * Represents specifically a text input in a spreadsheet cell handles updating the value in the backend
 * @param attribute the text attribute of this cell
 * @constructor
 */
const CellTextInput = forwardRef<CellInputRef, CellTextInputProps>(
({
    attribute,
    updateAttribute
}, ref) =>{
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

    useImperativeHandle(ref, () => ({
        setFocus: setFocus,
        openMenu: () => {},
        closeMenu: () => {},
        setValue: value => {
            const strValue = value as string
            setTextValue(strValue)
        }
    }))

    const setFocus = (fromClick:boolean = false) => {
        if(!inputRef.current) return

        inputRef.current.focus()

        if(!fromClick){
            //set the cursor to the end of the text
            const range = document.createRange()
            range.selectNodeContents(inputRef.current)
            range.collapse(false)
            const sel = window.getSelection()
            sel?.removeAllRanges()
            sel?.addRange(range)
        }
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
        updateAttribute(attribute.id, { textValue: cleaned })
    }

    //AI generated
    /** Returns true if caret can move left/right/up/down inside the text
     *  without leaving the text block (i.e. spreadsheet should NOT handle the key)
     */
    function shouldEditorHandleArrow(e: React.KeyboardEvent<HTMLParagraphElement>): boolean {
        const el = inputRef.current
        if (!el) return false

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return false

        const range = selection.getRangeAt(0)

        // ---- LEFT / RIGHT are trivial: use caret index ----
        const caretOffset = (() => {
            const r = range.cloneRange()
            r.selectNodeContents(el)
            r.setEnd(range.endContainer, range.endOffset)
            return r.toString().length
        })()

        const text = el.innerText

        if (e.key === "ArrowLeft") {
            return caretOffset > 0     // caret CAN move left → editor should handle it
        }

        if (e.key === "ArrowRight") {
            return caretOffset < text.length
        }

        // ---- UP / DOWN require pixel position from soft wrapping ----
        const rects = range.getClientRects()
        if (!rects || rects.length === 0) return false
        const caretRect = rects[0]

        const box = el.getBoundingClientRect()
        const style = window.getComputedStyle(el)
        const lineHeight = parseFloat(style.lineHeight)

        const topLimit = box.top + parseFloat(style.paddingTop)
        const bottomLimit = box.bottom - parseFloat(style.paddingBottom) - lineHeight

        if (e.key === "ArrowUp") {
            const nextRect = getPredictedCaretOffset(e.nativeEvent, el)
            if (!nextRect) return false
            if (nextRect.top > el.getBoundingClientRect().top + parseFloat(style.paddingTop)) {
                e.stopPropagation() // caret can move up
            }
        }

        if (e.key === "ArrowDown") {
            const nextRect = getPredictedCaretOffset(e.nativeEvent, el)
            if (!nextRect) return false
            if (nextRect.bottom < el.getBoundingClientRect().bottom - parseFloat(style.paddingBottom)) {
                e.stopPropagation() // caret can move down
            }
        }

        return false
    }

    function getPredictedCaretOffset(e: KeyboardEvent, el: HTMLElement) {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return null

        const range = selection.getRangeAt(0).cloneRange()

        if (e.key === "ArrowDown") {
            // Move a temporary range one character forward
            if (range.endOffset < el.innerText.length) {
                range.setStart(range.endContainer, range.endOffset + 1)
            }
        }

        if (e.key === "ArrowUp") {
            // Move a temporary range one character backward
            if (range.endOffset > 0) {
                range.setStart(range.endContainer, range.endOffset - 1)
            }
        }

        return range.getClientRects()[0]
    }

    return (
        <div
            className="cellInput"
            onClick={() => setFocus(true)}
        >
            <p
                className={"text"}
                ref={inputRef}
                contentEditable={true}
                onInput={updateTextValue}
                onKeyDown={(e) => {
                    // Prevent spreadsheet navigation
                    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                        if (shouldEditorHandleArrow(e)) {
                            e.stopPropagation()   // caret moves *inside* wrapped text
                            return
                        }
                    }

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
})

export default CellTextInput