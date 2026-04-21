import React from "react"
import "./loadingPage.scss"
import Loader from "@/components/feedback/loader/loader"
import Config from "@/Config"

export default function LoadingPage({title, className}: { title?: string, className?: string }) {
    return (
        <div className={`loadingPage ${className}`}>
            <title>{`Shotly | ${title}`}</title>
            <Loader text={title || Config.loadingMessage.generics}/>
        </div>
    )
}