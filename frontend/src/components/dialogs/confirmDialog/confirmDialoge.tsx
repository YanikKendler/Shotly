'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import "./confirmDialog.scss"
import LabeledCheckbox from "@/components/inputs/labeledCheckbox/labeledCheckbox"
import {VisuallyHidden} from "radix-ui"

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
    const [isOpen, setIsOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [promiseResolver, setPromiseResolver] = useState<(value: boolean) => void>();
    const [settings, setSettings] = useState<ConfirmDialogSettings>({} as ConfirmDialogSettings);

    function confirm(settings: ConfirmDialogSettings): Promise<boolean> {
        setSettings(settings)
        setIsOpen(true)
        setIsChecked(false)
        return new Promise((resolve) => {
            setPromiseResolver(() => resolve);
        });
    }

    function handleConfirm() {
        setIsOpen(false);
        promiseResolver?.(true);
    }

    function handleCancel() {
        setIsOpen(false);
        promiseResolver?.(false);
    }

    const ConfirmDialog = (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className={"confirmDialogOverlay dialogOverlay"}/>
                <Dialog.Content aria-describedby={"confirm action dialog"} className={"confirmDialogContent dialogContent"}>
                    <VisuallyHidden.Root>
                        <Dialog.Title>Confirm or cancel your action</Dialog.Title>
                    </VisuallyHidden.Root>

                    <Dialog.Title className={"title"}>{settings?.title || "Are you sure?"}</Dialog.Title>
                    <p className={"description"}>{settings.message}</p>
                    {settings.checkbox === true && (<LabeledCheckbox text="I know what I am doing" defaultChecked={isChecked} onCheckedChange={setIsChecked}/>)}
                    <div className={"buttons"}>
                        <button
                            className={`${settings?.buttons?.cancel?.className} cancel`}
                            onClick={e => {e.stopPropagation();handleCancel()}}
                        >
                            {settings?.buttons?.cancel?.text || "Cancel"}
                        </button>
                        <button
                            className={`${settings?.buttons?.confirm?.className} confirm`}
                            onClick={e => {e.stopPropagation();handleConfirm()}}
                            disabled={settings.checkbox === true && !isChecked}
                        >
                            {settings?.buttons?.confirm?.text || "Confirm"}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );

    return {confirm, ConfirmDialog};
}

