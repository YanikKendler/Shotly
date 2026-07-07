"use client"

import {ReactNode, useState} from "react"
import {X} from "lucide-react"
import "./banner.scss"

export default function Banner({
    children,
    vibrant = false
}:{
    children: ReactNode
    vibrant?: boolean
}){
    const [bannerIsOpen, setBannerIsOpen] = useState(true)

    if(bannerIsOpen)
        return (
            <div className={`banner ${vibrant && "vibrant"}`}>
                <div className={"content"}>
                    {children}
                </div>
                <button
                    className={"round"}
                    onClick={() => setBannerIsOpen(false)}
                >
                    <X size={18}/>
                </button>
            </div>
        )
}