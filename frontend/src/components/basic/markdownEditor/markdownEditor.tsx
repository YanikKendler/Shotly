import MDEditor, {commands, ICommand, ICommandBase, RefMDEditor} from '@uiw/react-md-editor/common';
import rehypeSanitize from "rehype-sanitize"
import "./markdownEditor.scss"
import {
    forwardRef,
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
    onKeyDown?: KeyboardEventHandler<HTMLDivElement>
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
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({
    value,
    onValueChange,
    placeholder,
    actions,
    toolbarCanHide = true,
    autoFocus = false,
    delayClose = false,
    onKeyDown
}, ref) =>{
    const [forceToolBarHidden, setForceToolBarHidden] = useState(true)

    const editorElementRef = useRef<RefMDEditor>(null)

    useEffect(() => {
        //remove after first render to trigger toolbar animation
        setForceToolBarHidden(false)
    }, []);

    useImperativeHandle(ref, () => ({
        focus: () => {
            const container = editorElementRef.current?.container

            if(!container) return

            container.querySelector("textarea")?.focus()
        },
        forceToolBarHidden: () => setForceToolBarHidden(true)
    }))

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
        let res =  <>{shortcut.map((s, i) => <>
                <span className={"key"}>{wuText.upperOrLowerRange(s, 0, 0)}</span>
                {i < shortcut.length - 1 ? " + " : ""}
            </>
        )}</>
        return res
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

    let extraCommands: ICommand[] = []

    if(actions && actions.length > 0)
        extraCommands = actions.map(action => ({
            name: 'action',
            keyCommand: 'action',
            icon: action.icon,
            execute: action.onClick,
            className: `action ${action.className}`,
            label: action.label,
            humanReadableShortcut: action.humanReadableShortcut
        })) as ShotlyICommand[]

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
            onChange={onValueChange}
            preview={"edit"}
            commands={customCommands}
            extraCommands={extraCommands}
            textareaProps={{
                placeholder: placeholder
            }}
            previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
            }}
            visibleDragbar={false}
            toolbarBottom={true}
            defaultTabEnable={true}
            autoFocus={autoFocus}
            onKeyDown={onKeyDown}
            components={{
                toolbar: (command, disabled, executeCommand) => {
                    const shotlyCommand = command as ShotlyICommand
                    return <SimpleTooltip
                        content={<>{shotlyCommand.label} {renderShortcut(shotlyCommand?.humanReadableShortcut || [])}</>}
                        fontSize={0.75}
                    >
                        <button
                            disabled={disabled}
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