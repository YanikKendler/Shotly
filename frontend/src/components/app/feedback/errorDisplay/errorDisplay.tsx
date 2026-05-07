import React from "react"
import {Frown} from "lucide-react"
import "./errorDisplay.scss"

export default function ErrorDisplay(
    {title, scale = 1, description, noMargin = false}:
    { title?: string, scale?: number, description?: string, noMargin?: boolean }
) {
    const softScale = (scale + 1) / 2

    return (
        <div className="errorDisplay" style={{marginTop: noMargin ? "1rem" : 4*softScale+"rem"}}>
            <Frown style={{width: 80 * softScale + "px"}} />
            <p className="title" style={{marginTop: 1.5*scale+"rem"}}>{title || "sorry - an error occurred"}</p>
            <p className="message" style={{marginTop: 0.5*scale+"rem"}}>{description || "please try again later"}</p>
        </div>
    );
}