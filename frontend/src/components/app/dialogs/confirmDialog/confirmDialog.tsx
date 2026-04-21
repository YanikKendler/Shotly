'use client';

import {useRef, useState} from 'react';
import "./confirmDialog.scss"
import LabeledCheckbox from "@/components/basic/labeledCheckbox/labeledCheckbox"
import {VisuallyHidden} from "radix-ui"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"

export interface ConfirmDialogSettings {
    title?: string
    message: string
    buttons?: {
        cancel?: ConfirmDialogButtonSettings
        confirm?: ConfirmDialogButtonSettings
    }
    checkbox?: boolean
}

export interface ConfirmDialogButtonSettings {
    text?: string
    className?: string
}

export function useConfirmDialog() {
    const dialogElementRef = useRef<DialogRef>(null);

    const [isChecked, setIsChecked] = useState(false);
    const [promiseResolver, setPromiseResolver] = useState<(value: boolean) => void>();
    const [settings, setSettings] = useState<ConfirmDialogSettings>({} as ConfirmDialogSettings);

    function confirm(settings: ConfirmDialogSettings): Promise<boolean> {
        setSettings(settings)
        dialogElementRef.current?.open()
        setIsChecked(false)
        return new Promise((resolve) => {
            setPromiseResolver(() => resolve);
        });
    }

    function handleConfirm() {
        dialogElementRef.current?.close()
        promiseResolver?.(true);
    }

    function handleCancel() {
        dialogElementRef.current?.close()
        promiseResolver?.(false)
    }

    const ConfirmDialog = (
        <Dialog
            ref={dialogElementRef}
            contentClassName={"confirmDialogContent"}
        >
            <h2 className={"title"}>{settings?.title || "Are you sure?"}</h2>
            <p className={"description"}>{settings.message}</p>
            {
                settings.checkbox === true &&
                <LabeledCheckbox
                    text="I know what I am doing"
                    defaultChecked={isChecked}
                    onCheckedChange={setIsChecked}
                />
            }
            <div className={"buttons"}>
                <button
                    className={`${settings?.buttons?.cancel?.className} cancel`}
                    onClick={e => {e.stopPropagation(); handleCancel()}}
                >
                    {settings?.buttons?.cancel?.text || "Cancel"}
                </button>
                <button
                    className={`${settings?.buttons?.confirm?.className} confirm`}
                    onClick={e => {e.stopPropagation(); handleConfirm()}}
                    disabled={settings.checkbox === true && !isChecked}
                >
                    {settings?.buttons?.confirm?.text || "Confirm"}
                </button>
            </div>
        </Dialog>
    )

    return {confirm, ConfirmDialog}
}

