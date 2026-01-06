import {useState} from "react"
import {Toast, VisuallyHidden} from "radix-ui"
import {XCircle} from "lucide-react"
import "./notification.scss"

export interface NotificationSettings {
    title?: string
    message: string
    duration?: number
    type?: "info" | "error" | "success"
}

export function Notification({
    settings
} : {
    settings: NotificationSettings
})  {
    return (
        <Toast.Root
            className={`ToastRoot notification ${settings.type || "info"}`}
            duration={settings.duration || 500000}
        >
            <Toast.Title className="ToastTitle">{settings.title}</Toast.Title>
            <Toast.Description className={"ToastDescription"}>
                {settings.message}
            </Toast.Description>

            <Toast.Close
                aria-label="Close"
                className={"ToastClose"}
            >
                <XCircle size={18}/>
            </Toast.Close>
        </Toast.Root>
    );
}