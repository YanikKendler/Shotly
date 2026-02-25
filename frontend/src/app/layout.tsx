import "./globals.scss"
import 'react-loading-skeleton/dist/skeleton.css'
import React from "react"
import {ApolloWrapper} from "@/components/wrapper/ApolloWrapper"
import {Inter} from 'next/font/google'
import {Toast, Tooltip} from "radix-ui"
import AuthWrapper from "@/components/wrapper/AuthWrapper"
import Config from "@/util/Config"
import {Metadata, Viewport} from "next"
import {SkeletonTheme} from "react-loading-skeleton"
import {Toaster} from "react-hot-toast"
import {CircleAlert, CircleCheck} from "lucide-react"
import Script from "next/script"
import Link from "next/link"

export const metadata: Metadata = {
    description:
        "A freemium, source available, no-AI, clean and simple shotlist creation tool for filmmakers.",
    keywords: [
        "shotlist",
        "shotlist creation",
        "film shotlist",
        "video shotlist",
        "film production",
        "video production",
        "pre-production",
        "production planning",
        "film planning",
        "shoot planning",
        "storyboarding",
        "cinematography",
        "cinematographer tools",
        "director tools",
        "filmmaking tools",
        "production tools",
        "film crew collaboration",
        "no AI filmmaking",
        "film production software",
        "video production software",
        "film production planning",
        "script breakdown",
        "film project management",
        "digital shotlist",
        "freemium filmmaking software",
        "clean shotlist app",
        "simple shotlist app",
        "shotlist template",
        "camera shot planning"
    ],

    metadataBase: new URL("https://shotly.at"),
    openGraph: {
        title: "Shotly | Shotlist creation made easy",
        description:
            "A freemium, source available, no-AI, clean and simple shotlist creation tool for filmmakers.",
        url: "https://shotly.at",
        siteName: "Shotly",
        images: [
            {
                url: "https://shotly.at/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Shotly - Shotlist Creation Tool"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Shotly | Shotlist creation made easy",
        description:
            "Create clean, professional shotlists with Shotly. Source available and no AI.",
        images: ["https://shotly.at/og-image.jpg"],
    },
    authors: [{ name: "Yanik Kendler", url: "https://yanik.kendler.me" }],
    creator: "Yanik Kendler",
    publisher: "Shotly",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png"
    }
}

export const viewport: Viewport = {
    themeColor: "#F04800"
}

const inter = Inter({
    subsets: ['latin']
})

export default function RootLayout({
   children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={inter.className} suppressHydrationWarning>
        <head>
            {/*has to be native "head" not nextJS "Head" or the darkmode query won't be run*/}
            {/*set the theme attribute (dark or light) based on the user preference (dark light or system)*/}
            <script dangerouslySetInnerHTML={{__html: `(() => {
                let userPreference = localStorage.getItem('shotly-theme') || 'system';
                if (userPreference === 'system') {
                    const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-theme', systemPref);
                } else {
                    document.documentElement.setAttribute('data-theme', userPreference);
                }
            })()`}}/>
            <script>
                {`window.sa_event=window.sa_event||function(){var a=[].slice.call(arguments);window.sa_event.q?window.sa_event.q.push(a):window.sa_event.q=[a]};`}
            </script>
            <title>Shotly</title>
        </head>
        <body>
            <div className="root">
                {(Config.mode === "dev-deployment") && <div className="infoBanner">You are currently viewing a dev deployment. Please go to <Link className={"inline noPadding"} href={"https://shotly.at"}>Shotly.at</Link> instead.</div>}
                <AuthWrapper> {/*should be the outermost*/}
                    <ApolloWrapper> {/*should also be out*/}
                        <Tooltip.Provider>
                            <SkeletonTheme baseColor="var(--skelleton-base-color)" highlightColor="var(--skelleton-highlight-color)">
                                {children}
                            </SkeletonTheme>
                        </Tooltip.Provider>
                    </ApolloWrapper>
                </AuthWrapper>
            </div>
            <Toaster
                position={"bottom-center"}
                containerStyle={{fontSize: ".9rem"}}
                toastOptions={{
                    className: "toast",
                    error: {
                        className: "toast error",
                        icon: <CircleAlert/>,
                        duration: 10000
                    },
                    success: {
                        className: "toast success",
                        icon: <CircleCheck />
                    },
                }}
            />
        </body>
        </html>
    )
}
