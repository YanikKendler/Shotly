'use client'

import Auth from "@/Auth"
import {useEffect, useState} from "react"

export default function ThemeSwitcher({ light, dark, loader}: {light: React.ReactElement, dark: React.ReactElement, loader?: React.ReactElement}) {
    const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

    useEffect(() => {
        setIsDarkMode(document.documentElement.getAttribute('data-theme') === "dark")
    }, [])

    if(isDarkMode == null && loader)
        return loader

    if(isDarkMode == true) {
        return dark
    }
    return light
}