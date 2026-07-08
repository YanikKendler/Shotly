import React, {ReactNode} from "react"
import {ApolloWrapper} from "@/wrapper/ApolloWrapper"
import AuthWrapper from "@/wrapper/AuthWrapper"
import Ralph from "@/components/app/ralph/ralph"
import {AppContextProvider} from "@/context/AppContext"

export default function AppLayout({
    children
}:{
    children: ReactNode
}){
    return (
       <AuthWrapper> {/*should be the outermost*/}
            <ApolloWrapper> {/*should also be out*/}
                <AppContextProvider>
                    {children}
                    <Ralph/>
                </AppContextProvider>
            </ApolloWrapper>
        </AuthWrapper>
    )
}