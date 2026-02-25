import React from "react"
import SimplePage from "@/components/simplePage/simplePage"

export default function Legal({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <SimplePage>
            <title>Shotly | Legal</title>
            {children}
        </SimplePage>
    )
}