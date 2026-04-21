import toast from "react-hot-toast"
import {CircleCheck, CircleX, Info, X} from "lucide-react"

export interface NotificationAction {
    label: string,
    onClick: () => void
}

export interface NotificationProps {
    title?: string,
    message?: string,
    sub?: string,
    action?: NotificationAction
}

export interface ErrorNotificationProps extends NotificationProps {
    tryAgainLater?: boolean
}

export function errorNotification({ title, message, sub, tryAgainLater, action} : ErrorNotificationProps) {
    const subMessage = sub ? sub : tryAgainLater ? "Please try again later." : null
    toast.error((t) => (
        <>
            <div className="content">
                {title && <p className="title">{title}</p>}
                {message && <p className="message">{message}</p>}
                {subMessage && <p className="sub">{subMessage}</p>}
            </div>
            {
                action &&
                <button
                    className={"default action"}
                    onClick={() => {
                        action.onClick()
                        toast.dismiss(t.id)
                    }}
                >
                    {action.label}
                </button>
            }
            <button className={"default round close"} onClick={() => toast.dismiss(t.id)}><X size={22}/></button>
        </>
    ), {
        icon: <CircleX/>,
        duration: Infinity
    })
}

export function infoNotification({ title, message, sub, action} : NotificationProps) {
    toast((t) => (
        <>
            <div className={"content"}>
                {title && <p className="title">{title}</p>}
                {message && <p className="message">{message}</p>}
                {sub && <p className="sub">{sub}</p>}
            </div>
            {
                action &&
                <button
                    className={"default action"}
                    onClick={() => {
                        action.onClick()
                        toast.dismiss(t.id)
                    }}
                >
                    {action.label}
                </button>
            }
        </>
    ), {
        icon: <Info/>,
        duration: ((title?.length || 0) + (message?.length || 0) + (sub?.length || 0)) * 50
    })
}

export function successNotification({ title, message, sub, action} : NotificationProps) {
    toast.success((t) => (
        <>
            <div className={"content"}>
                {title && <p className="title">{title}</p>}
                {message && <p className="message">{message}</p>}
                {sub && <p className="sub">{sub}</p>}
            </div>
            {
                action &&
                <button
                    className={"default action"}
                    onClick={() => {
                        action.onClick()
                        toast.dismiss(t.id)
                    }}
                >
                    {action.label}
                </button>
            }
        </>
    ), {
        icon: <CircleCheck/>,
        duration: ((title?.length || 0) + (message?.length || 0) + (sub?.length || 0)) * 50
    })
}