import React from "react"
import {Frown} from "lucide-react"
import "./errorDisplay.scss"

export default function ErrorDisplay(
    {title, scale = 1, description}:
    { title?: string, scale?: number, description?: string }
) {
    return (
        <div className="errorDisplay">
            <Frown />
            <p className="title" style={{marginTop: 1.5*scale+"rem"}}>{title || "sorry - an error occurred"}</p>
            <p className="message" style={{marginTop: 0.5*scale+"rem"}}>{description || "please try again later"}</p>
        </div>
    );
}