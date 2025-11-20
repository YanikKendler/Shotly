import React from "react"
import "./loadingPage.scss"
import Loader from "@/components/loader/loader"

export default function LoadingPage({text, className}: { text?: string, className?: string }) {
    return (
        <div className={`loadingPage ${className}`}>
            <Loader text={text}/>
        </div>
    )
}