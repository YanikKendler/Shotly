"use client"

import Config from "@/Config"
import Link from "next/link"
import {useState} from "react"
import {X} from "lucide-react"
import "./devDeploymentBanner.scss"

export default function DevDeploymentBanner(){
    const [bannerIsOpen, setBannerIsOpen] = useState(true)

    if(Config.mode == "dev-deployment" && bannerIsOpen)
        return (
            <div className="devDeploymentBanner">
                <span>
                    You are currently viewing a development deployment. Please go to <Link className={"inline noPadding"} href={"https://shotly.at"}>Shotly.at</Link> instead.
                </span>
                <button onClick={() => setBannerIsOpen(false)}><X size={20}/></button>
            </div>
        )
}