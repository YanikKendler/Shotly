"use client"

import {useEffect, useState} from "react"

export function useScreenWidth() {
    const [windowWidth, setWindowWidth] = useState<number>(0)

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowWidth
}