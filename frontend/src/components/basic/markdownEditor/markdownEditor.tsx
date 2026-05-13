import MDEditor, {commands, ICommand, RefMDEditor} from '@uiw/react-md-editor/common';
import rehypeSanitize from "rehype-sanitize"
import "./markdownEditor.scss"
import {forwardRef, ReactElement, ReactNode, useImperativeHandle, useMemo, useRef} from "react"
import {
    Bold, Italic, Strikethrough, List,
    ListOrdered, Quote, Link as LinkIcon
} from "lucide-react";

export interface MarkdownEditorRef {
    focus: () => void
}

export interface MarkdownEditorProps {
    value: string | undefined,
    onValueChange: (value: string | undefined) => void
    placeholder?: string
    action?: MarkdownEditorAction
    toolbarCanHide?: boolean
}

export interface MarkdownEditorAction {
    name: string
    label: string
    icon: ReactElement
    shortcut: string
    disabled: boolean
    onClick: () => void
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({
    value,
    onValueChange,
    placeholder,
    action,
    toolbarCanHide = true
}, ref) =>{
    const editorElementRef = useRef<RefMDEditor>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            const container = editorElementRef.current?.container

            if(!container) return

            container.querySelector("textarea")?.focus()
        }
    }))

    /**
     * custom command to remove the default behavior of selecting the inserted list command: "- "
     * @param prefix
     */
    const insertListPrefix = (prefix: string): ICommand["execute"] => (state, api) => {
        api.replaceSelection(prefix);
        const newPos = state.selection.start + prefix.length;
        api.setSelectionRange({ start: newPos, end: newPos });
    }

    const customCommands = useMemo(() => {
        return [
            { ...commands.bold, icon: <Bold size={14} /> },
            { ...commands.italic, icon: <Italic size={14} /> },
            { ...commands.strikethrough, icon: <Strikethrough size={14} /> },

            commands.divider,

            {
                ...commands.unorderedListCommand,
                icon: <List size={16} />,
                execute: insertListPrefix("- ")
            },
            {
                ...commands.orderedListCommand,
                icon: <ListOrdered size={16} />,
                execute: insertListPrefix("1. ")
            },

            commands.divider,

            { ...commands.quote, icon: <Quote size={13} /> },
            { ...commands.link, icon: <LinkIcon size={14} /> },
        ];
    }, [])

    let additionalAction: ICommand | null = null

    if(action)
        additionalAction = {
            name: 'action',
            keyCommand: 'action',
            buttonProps: { 'aria-label': action.label, "disabled": action.disabled },
            shortcuts: action.shortcut,
            icon: action.icon,
            execute: action.onClick
        }

    return (
        <MDEditor
            ref={editorElementRef}
            className={`markdownEditor ${(value?.length || 0) > 0 && "hasValue"} ${!toolbarCanHide && "hasValue"}`}
            value={value}
            onChange={onValueChange}
            preview={"edit"}
            commands={customCommands}
            extraCommands={additionalAction ? [additionalAction] : []}
            textareaProps={{
                placeholder: placeholder
            }}
            previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
            }}
            visibleDragbar={false}
            toolbarBottom={true}
            defaultTabEnable={true}
        />
    )
})

export default MarkdownEditor