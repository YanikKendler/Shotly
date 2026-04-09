'use client'

import { useEffect, useState } from "react"

export default function ViewPortSwitcher({
    under,
    over,
    breakpoint
}: {
    under: React.ReactElement | string
    over: React.ReactElement | string
    breakpoint: number
}) {
    const [windowWidth, setWindowWidth] = useState<number | null>(null)

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (windowWidth === null) return null

    if(windowWidth > breakpoint)
        return over
    else
        return under
}