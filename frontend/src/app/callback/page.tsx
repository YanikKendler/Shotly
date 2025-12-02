"use client"

import {useEffect} from "react"
import auth from "@/Auth"
import { useRouter } from 'next/navigation'
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import Auth from "@/Auth"

export default function CallbackPage() {
    const router = useRouter()

    useEffect(() => {
        auth.handleAuthentication()
            .then((targetUrl) => {
                console.log("redirecting to dashboard")
                router.push(targetUrl)
            })
            .catch((error) => {
                console.error("Error during authentication:", error);
                Auth.logout()
            });
    }, []);

    return (
        <LoadingPage title={"logging you in"}/>
    )
}