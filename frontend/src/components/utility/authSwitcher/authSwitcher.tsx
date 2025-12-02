'use client'

import Auth from "@/Auth"
import {useEffect, useState} from "react"

export default function AuthSwitcher({ unauthenticated, authenticated}: {unauthenticated: React.ReactElement, authenticated: React.ReactElement}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(Auth.isAuthenticated())
    }, [])

    if(isAuthenticated) {
        return authenticated
    }
    return unauthenticated
}