import React from "react"
import "./loadingPage.scss"
import Loader from "@/components/loader/loader"

export default function LoadingPage({title, className}: { title?: string, className?: string }) {
    return (
        <div className={`loadingPage ${className}`}>
            <Loader text={title}/>
        </div>
    )
}