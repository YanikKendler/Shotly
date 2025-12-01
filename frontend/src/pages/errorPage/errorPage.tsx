'use client'

import "./errorPage.scss"
import React from "react"
import Link from "next/link"
import LoadingPage from "@/pages/loadingPage/loadingPage"
import Utils from "@/util/Utils"

export default function ErrorPage(
    {
        title = "Error",
        description = "An unexpected error occurred.",
        link = {
            text: "Dashboard",
            href: "/dashboard"
        }
    }:
    {
        title: string
        description: string
        link: {
            text: string
            href: string
        }
    }
) {
    return (
        <div className={"errorPage"}>
            <div className="content">
                <span className="smiley">:(</span>
                <div className="main">
                    <h1
                        style={{fontSize: Utils.clampFontSizeByTextLength(title, {length: 10, fontSize: 4*16}, {length: 25, fontSize: 2*16})}}
                    >
                        {title}
                    </h1>
                    <p className={"description"}>{description}</p>
                    <Link className={"solid"} href={link.href}>{link.text}</Link>
                </div>
            </div>
        </div>
    );
}
