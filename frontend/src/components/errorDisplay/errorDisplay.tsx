import React from "react"
import "./errorDisplay.scss"
import {Frown} from "lucide-react"

export default function ErrorDisplay({text, scale = 1, message}: { text?: string, scale?: number, message?: string }) {
    return (
        <div className="errorDisplay">
            <Frown />
            <p className="text" style={{marginTop: 1.5*scale+"rem"}}>{text || "sorry - an error occurred"}</p>
            <p className="message" style={{marginTop: 0.5*scale+"rem"}}>{message || "please try again later"}</p>
        </div>
    );
}