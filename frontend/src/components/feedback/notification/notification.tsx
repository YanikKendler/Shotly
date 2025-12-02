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

export function useNotification() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<NotificationSettings>({} as NotificationSettings);

    function notify(settings: NotificationSettings) {
        setSettings(settings)
        setIsOpen(true)
    }

    function handleClose() {
        setIsOpen(false);
    }

    const Notification = (
        <Toast.Root className={`ToastRoot notification ${settings.type || "info"}`} open={isOpen} onOpenChange={setIsOpen} duration={settings.duration || 5000}>
            <Toast.Title className="ToastTitle">{settings.title}</Toast.Title>
            <Toast.Description className={"ToastDescription"}>
                {settings.message}
            </Toast.Description>

            <Toast.Close
                aria-label="Close"
                onClick={handleClose}
                className={"ToastClose"}
            >
                <XCircle/>
            </Toast.Close>
        </Toast.Root>
    );

    return {notify, Notification};
}