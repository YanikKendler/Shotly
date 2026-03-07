import {Portal} from "radix-ui"
import {forwardRef, ReactNode, useEffect, useImperativeHandle, useRef} from "react"
import "./dialog.scss"
import {tinykeys, KeyBindingMap} from "@/../node_modules/tinykeys/dist/tinykeys" /*package has incorrectly configured type exports*/

interface DialogProps {
    children: ReactNode
    onOpenChange?: (isOpen: boolean) => void
    onRenderFinish?: () => void
    contentClassName?: string
    keyBinds?: KeyBindingMap
}

export interface DialogRef {
    open: () => void
    close: () => void
    toggle: () => void
    setOpen: (isOpen: boolean) => void
}

const Dialog = forwardRef<DialogRef, DialogProps>(({
    children,
    onOpenChange = () => {},
    onRenderFinish = () => {},
    contentClassName = "",
    keyBinds = {}
}, ref) => {
    const dialogElement = useRef<HTMLDivElement>(null)
    const removeKeyBinds = useRef<() => void>(() => {})
    const initialRenderFinished = useRef(false)

    useEffect(() => {
        if(initialRenderFinished.current == true) return

        if(!dialogElement.current) return

        initialRenderFinished.current = true
        onRenderFinish()
    }, [dialogElement.current])


    useImperativeHandle(ref, () => ({
        open: open,
        close: close,
        toggle: () => {
            if(dialogElement.current?.dataset.state == "open")
                close()
            else
                open()
        },
        setOpen: (isOpen) => {
            if(open)
                open()
            else
                close()
        }
    }))

    const setDisplay = (open: boolean) => {
        if(!dialogElement.current) return

        dialogElement.current.style.display = open ? "grid" : "none"
        dialogElement.current.dataset.state = open ? "open" : "closed"
    }

    const open = () => {
        if(!dialogElement.current) {
            console.error("Cannot open dialog because element ref does not yet exist")
            return
        }

        setDisplay(true)

        onOpenChange(true)

        dialogElement.current.focus();

        removeKeyBinds.current = tinykeys(dialogElement.current, {
            "Escape": (e) => {
                e.stopImmediatePropagation()
                e.preventDefault()
                close()
            },
            ...keyBinds
        })
    }

    const close = () => {
        setDisplay(false)
        onOpenChange(false)
        removeKeyBinds.current()
    }

    const handleScroll = () => {
        const contentElement = dialogElement.current?.querySelector(".content") as HTMLDivElement

        if(!contentElement) return

        console.log(contentElement.scrollTop)

        if(contentElement.scrollTop > 5)
            contentElement.classList.add("scrolled")
        else
            contentElement.classList.remove("scrolled")
    }

    return <Portal.Root>
        <div
            className="dialog"
            ref={dialogElement}
            tabIndex={-1}
        >
            <div className={`content ${contentClassName}`} onScroll={handleScroll}>
                {children}
            </div>
            <div className="overlay" onClick={close}/>
        </div>
    </Portal.Root>
})

export default Dialog