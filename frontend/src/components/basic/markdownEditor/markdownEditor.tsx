import MDEditor, {commands, ICommand, RefMDEditor} from '@uiw/react-md-editor/common';
import rehypeSanitize from "rehype-sanitize"
import "./markdownEditor.scss"
import {forwardRef, ReactElement, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react"
import {
    Bold, Italic, Strikethrough, List,
    ListOrdered, Quote, Link as LinkIcon
} from "lucide-react";

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
}

export interface MarkdownEditorAction {
    name: string
    label: string
    icon: ReactElement
    shortcut?: string
    disabled?: boolean
    onClick: () => void
    className?: string
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({
    value,
    onValueChange,
    placeholder,
    actions,
    toolbarCanHide = true,
    autoFocus = false,
    delayClose = false
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

    let extraCommands: ICommand[] = []

    if(actions && actions.length > 0)
        extraCommands = actions.map(action => ({
            name: 'action',
            keyCommand: 'action',
            buttonProps: { 'aria-label': action.label, "disabled": action.disabled, "className": `action ${action.className}`},
            shortcuts: action.shortcut,
            icon: action.icon,
            execute: action.onClick
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
        />
    )
})

export default MarkdownEditor