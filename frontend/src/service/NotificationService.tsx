import toast from "react-hot-toast"

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