
"use client"

import {useEffect} from "react"
import auth from "@/Auth"
import LoadingPage from "@/pages/loadingPage/loadingPage"

export default function LoginRedirectPage() {
    useEffect(() => {
        auth.login()
    }, []);

    return (
        <LoadingPage title={"logging you in"}/>
    )
}