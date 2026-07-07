import React, {ReactNode} from "react"
import {ApolloWrapper} from "@/wrapper/ApolloWrapper"
import AuthWrapper from "@/wrapper/AuthWrapper"
import Ralph from "@/components/app/ralph/ralph"
import {AppContextProvider} from "@/context/AppContext"
import Config from "@/Config"
import Banner from "@/components/basic/banner/banner"
import Link from "next/link"

export default function AppLayout({
    children
}:{
    children: ReactNode
}){
    return (
        <>
            {
                Config.mode == "dev-deployment" &&
                <Banner vibrant>
                    You are currently viewing a development deployment. Please go to <Link className={"inline noPadding"} href={"https://shotly.at"}>Shotly.at</Link> instead.
                </Banner>
            }

            <AuthWrapper> {/*should be the outermost*/}
                <ApolloWrapper> {/*should also be out*/}
                    <AppContextProvider>
                        {children}
                        <Ralph/>
                    </AppContextProvider>
                </ApolloWrapper>
            </AuthWrapper>
        </>
    )
}