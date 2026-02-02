"use client"

import { SimpleAnalytics } from "@simpleanalytics/react";
import Config from "@/util/Config"

export default function Analytics(){
    return <SimpleAnalytics domain={Config.frontendURL}/>
}