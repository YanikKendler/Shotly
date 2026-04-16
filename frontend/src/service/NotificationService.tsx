import toast from "react-hot-toast"
import {Check, Info, X} from "lucide-react"

export function errorNotification({ message, title, sub, tryAgainLater}:{message?: string, title?: string, sub?: string, tryAgainLater?: boolean}) {
    const subMessage = sub ? sub : tryAgainLater ? "Please try again later." : null
    const toastId = toast.error((t) => (
        <>
            <div className="content">
                {title && <p className="title">{title}</p>}
                {message && <p className="message">{message}</p>}
                {subMessage && <p className="sub">{subMessage}</p>}
            </div>
            <button className={"default round close"} onClick={() => toast.dismiss(toastId)}><X size={22}/></button>
        </>
    ), {
        duration: Infinity
    })
}

export function infoNotification({ message, title, sub}:{message?: string, title?: string, sub?: string}) {
    toast((t) => (
        <div>
            {title && <p className="title">{title}</p>}
            {message && <p className="message">{message}</p>}
            {sub && <p className="sub">{sub}</p>}
        </div>
    ), {
        icon: <Info/>,
        duration: ((title?.length || 0) + (message?.length || 0) + (sub?.length || 0)) * 50
    })
}

export function successNotification({ message, title, sub}:{message?: string, title?: string, sub?: string}) {
    toast.success((t) => (
        <div>
            {title && <p className="title">{title}</p>}
            {message && <p className="message">{message}</p>}
            {sub && <p className="sub">{sub}</p>}
        </div>
    ), {
        icon: <Check/>,
        duration: ((title?.length || 0) + (message?.length || 0) + (sub?.length || 0)) * 50
    })
}