import React from "react"
import SimplePage from "@/components/app/simplePage/simplePage"

export default function Legal({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <SimplePage>
            <title>Shotly | Legal</title>
            {children}
        </SimplePage>
    )
}