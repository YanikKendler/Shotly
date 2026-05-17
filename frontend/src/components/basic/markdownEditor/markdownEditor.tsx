import MDEditor, {commands, ICommand, ICommandBase, RefMDEditor} from '@uiw/react-md-editor/common';
import rehypeSanitize from "rehype-sanitize"
import "./markdownEditor.scss"
import {
    forwardRef, Fragment,
    KeyboardEventHandler, ReactElement, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState
} from "react"
import {
    Bold, Italic, Strikethrough, List,
    ListOrdered, Quote, Link as LinkIcon
} from "lucide-react";
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import {wuText} from "@yanikkendler/web-utils/dist"

export interface MarkdownEditorRef {
    focus: () => void,
    forceToolBarHidden: () => void
}

export interface MarkdownEditorProps {
    value: string | undefined,
    onValueChange: (value: string | undefined) => void
    placeholder?: string
    actions?: MarkdownEditorAction[]
    toolbarCanHide?: boolean
    autoFocus?: boolean
    delayClose?: boolean
    onCtrlEnter?: () => void
    shortCharacterCountDisplay?: boolean
}

export interface MarkdownEditorAction {
    name: string
    label: string
    icon: ReactElement
    disabled?: boolean
    onClick: () => void
    className?: string
    humanReadableShortcut?: string[]
}

interface ShotlyICommand extends ICommandBase<string> {
    label?: string,
    humanReadableShortcut?: string[],
    className?: string
    disabled?: boolean
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({
    value,
    onValueChange,
    placeholder,
    actions,
    toolbarCanHide = true,
    autoFocus = false,
    delayClose = false,
    onCtrlEnter,
    shortCharacterCountDisplay = false
}, ref) =>{
    const [forceToolBarHidden, setForceToolBarHidden] = useState(true)

    const characterCountElement = useRef<HTMLSpanElement>(null)

    const editorElementRef = useRef<RefMDEditor>(null)

    useEffect(() => {
        //remove after first render to trigger toolbar animation
        setForceToolBarHidden(false)
    }, [])

    useEffect(() => {
        checkCharacterCount()
    }, [value])

    useImperativeHandle(ref, () => ({
        focus: () => {
            const container = editorElementRef.current?.container

            if(!container) return

            container.querySelector("textarea")?.focus()
        },
        forceToolBarHidden: () => setForceToolBarHidden(true)
    }))

    const handleValueChange = (newValue: string | undefined) => {
        if (!newValue || newValue.length <= 1000) {
            onValueChange(newValue)
            return
        }
    }

    const checkCharacterCount = () => {
        if(!characterCountElement.current) return

        if(value && value.length >= 990) {
            characterCountElement.current.style.display = "block"
            characterCountElement.current.innerText = `${value.length}${shortCharacterCountDisplay ? "" : "/1000"}`
        }
        else {
            characterCountElement.current.style.display = "none"
        }

        if(value && value.length >= 1000) {
            characterCountElement.current.classList.add("max")
        }
        else {
            characterCountElement.current.classList.remove("max")
        }
    }

    /**
     * custom command to remove the default behavior of selecting the inserted prefix
     * @param prefix
     */
    const insertPrefix = (prefix: string): ICommand["execute"] => (state, api) => {
        api.replaceSelection(prefix);
        const newPos = state.selection.start + prefix.length;
        api.setSelectionRange({ start: newPos, end: newPos });
    }

    const renderShortcut = (shortcut: string[]): ReactNode => {
        return <>{shortcut.map((s, i) => <Fragment key={i}>
                <span className={"key"}>{wuText.upperOrLowerRange(s, 0, 0)}</span>
                {i < shortcut.length - 1 ? " + " : ""}
            </Fragment>
        )}</>
    }

    const customCommands = useMemo(() => {
        return [
            {
                ...commands.bold,
                icon: <Bold size={14} />,
                label: "Bold",
                humanReadableShortcut: ["ctrl", "B"]
            },
            {
                ...commands.italic,
                icon: <Italic size={14} />,
                label: "Italic",
                humanReadableShortcut: ["ctrl", "I"]
            },
            {
                ...commands.strikethrough,
                icon: <Strikethrough size={14} />,
                label: "Strikethrough",
                humanReadableShortcut: ["ctrl", "shift", "X"]
            },

            commands.divider,

            {
                ...commands.unorderedListCommand,
                icon: <List size={16} />,
                label: "Unordered List",
                humanReadableShortcut: ["ctrl", "shift", "U"],
                execute: insertPrefix("- ")
            },
            {
                ...commands.orderedListCommand,
                icon: <ListOrdered size={16} />,
                label: "Ordered List",
                humanReadableShortcut: ["ctrl", "shift", "O"],
                execute: insertPrefix("1. ")
            },

            commands.divider,

            {
                ...commands.quote,
                icon: <Quote size={13} />,
                label: "Quote",
                humanReadableShortcut: ["ctrl", "Q"],
                execute: insertPrefix("> ")
            },
            {
                ...commands.link,
                icon: <LinkIcon size={14} />,
                label: "Link",
                humanReadableShortcut: ["ctrl", "L"]
            },
        ] as ShotlyICommand[];
    }, [])

    let extraCommands: ShotlyICommand[] = [{
        name: 'characterCount',
        keyCommand: 'characterCount',
        execute: () => {},
    }]

    if(actions && actions.length > 0)
        actions.forEach(action => extraCommands.push({
            name: 'action',
            keyCommand: 'action',
            icon: action.icon,
            execute: action.onClick,
            className: `action ${action.className}`,
            label: action.label,
            humanReadableShortcut: action.humanReadableShortcut,
            disabled: action.disabled
        }))

    return (
        <MDEditor
            ref={editorElementRef}
            className={`
                markdownEditor
                ${(value?.length || 0) > 0 && "hasValue"}
                ${!toolbarCanHide && "hasValue"}
                ${forceToolBarHidden && "forceToolbarHidden"}
                ${delayClose && "delayClose"}
            `}
            value={value}
            onChange={handleValueChange}
            preview={"edit"}
            commands={customCommands}
            extraCommands={extraCommands}
            textareaProps={{
                placeholder: placeholder,
                onKeyDownCapture: (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.stopPropagation();
                        e.preventDefault();

                        if(onCtrlEnter)
                            onCtrlEnter()
                    }
                },
            }}
            previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
            }}
            visibleDragbar={false}
            toolbarBottom={true}
            defaultTabEnable={true}
            autoFocusEnd={autoFocus}
            components={{
                toolbar: (command, disabled, executeCommand) => {
                    const shotlyCommand = command as ShotlyICommand

                    if(command.name == "characterCount") {
                        return <span ref={characterCountElement} className={`characterCount`}></span>
                    }

                    return <SimpleTooltip
                        content={<>{shotlyCommand.label} {renderShortcut(shotlyCommand?.humanReadableShortcut || [])}</>}
                        fontSize={0.75}
                    >
                        <button
                            disabled={disabled || shotlyCommand.disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                executeCommand(command, command.groupName)
                            }}
                            className={shotlyCommand.className}
                        >
                            {command.icon}
                        </button>
                    </SimpleTooltip>
                }
            }}
        />
    )
})

export default MarkdownEditor