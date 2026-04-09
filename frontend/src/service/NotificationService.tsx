import toast from "react-hot-toast"
import {Info} from "lucide-react"

export function errorNotification({ message, title, sub, tryAgainLater}:{message?: string, title?: string, sub?: string, tryAgainLater?: boolean}) {
    const subMessage = sub ? sub : tryAgainLater ? "Please try again later." : null
    toast.error((t) => (
        <div>
            {title && <p className="title">{title}</p>}
            {message && <p className="message">{message}</p>}
            {subMessage && <p className="sub">{subMessage}</p>}
        </div>
    ))
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
        duration: 1400
    })
}