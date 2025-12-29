'use client'

import "./errorPage.scss"
import React from "react"
import Link from "next/link"
import Utils from "@/util/Utils"

export default function ErrorPage(
    {
        title = "Error",
        description = "An unexpected error occurred.",
        link = {
            text: "Dashboard",
            href: "/dashboard"
        },
        reload = false,
        noButton = false
    }:
    {
        title: string
        description: string
        link?: {
            text: string
            href: string
        }
        reload?: boolean
        noButton?: boolean
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
                    {
                        reload ?
                        <Link
                            className={"solid"}
                            href="#"
                            onClick={() => window.location.reload()}
                        >
                            Reload
                        </Link> :
                        noButton ? null :
                        <Link className={"solid"} href={link.href}>{link.text}</Link>
                    }
                </div>
            </div>
        </div>
    );
}
