import React from "react"
import SimplePage from "@/components/simplePage/simplePage"

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <SimplePage>
            {children}
        </SimplePage>
    )
}