import {Separator as RdxSeparator} from "radix-ui"
import React from "react"
import {wuConstants, wuText} from "@yanikkendler/web-utils/dist"
import "./separator.scss"

export default function Separator({
    decorative = false,
    orientation = "horizontal",
    text,
    className = ""
}:{
    decorative?: boolean
    orientation?: "horizontal" | "vertical"
    text?: string
    className?: string
}){
    if(text && !wuConstants.Regex.empty.test(text))
        return <span className={`separator ${className} ${orientation}`}>
            <RdxSeparator.Separator decorative={decorative} orientation={orientation} className={`RdxSeparator split short`}/>
            <span className={`text ${orientation}`}>{text}</span>
            <RdxSeparator.Separator decorative={decorative} orientation={orientation} className={`RdxSeparator split long`}/>
        </span>

    return <span className={`separator ${className} ${orientation}`}>
        <RdxSeparator.Separator decorative={decorative} orientation={orientation} className={`RdxSeparator`}/>
    </span>
}