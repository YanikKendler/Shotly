'use client'

import "./errorPage.scss"
import React from "react"
import Link from "next/link"
import Utils from "@/util/Utils"
import Wordmark from "@/components/wordmark"

export default function ErrorPage(
    {
        title = "Error",
        description = "An unexpected error occurred.",
        link = undefined,
        reload = false,
        noLink = false
    }:
    {
        title: string
        description: string
        link?: {
            text: string
            href: string
        }[]
        reload?: boolean
        noLink?: boolean
    }
) {
    return (
        <div className={"errorPage"}>
            <div className={"header"}>
                <Link href={"/"}><Wordmark/></Link>
            </div>
            <div className="content">
                <span className="smiley">:(</span>
                <div className="main">
                    <h1
                        style={{fontSize: Utils.clampFontSizeByTextLength(title, {length: 10, fontSize: 4*16}, {length: 25, fontSize: 2*16})}}
                    >
                        {title}
                    </h1>
                    <p className={"description"}>{description}</p>
                    <div className="buttons">
                        {
                            reload &&
                            <Link
                                className={"solid"}
                                href="#"
                                onClick={() => window.location.reload()}
                            >
                                Reload
                            </Link>
                        }
                        {
                            noLink ?
                            null :
                                link ?
                                link?.map((l, i) =>
                                    <Link key={i} className={"solid"} href={l.href}>{l.text}</Link>
                                ) :
                                <Link className={"solid"} href="/dashboard">Dashboard</Link>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
