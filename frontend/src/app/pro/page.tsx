"use client";

import Auth from "@/Auth"
import "./pro.scss";
import {use, useEffect, useState} from "react"
import auth from "@/Auth"
import LoadingPage from "@/pages/loadingPage/loadingPage"
import gql from "graphql-tag"
import {useApolloClient} from "@apollo/client"
import {useRouter} from "next/navigation"
import {Config} from "@/util/Utils"
import PaymentService from "@/service/PaymentService"

export default function Pro(){
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const client = useApolloClient();
    const router = useRouter();

    const [action, setAction] = useState({name: "Continue to Checkout", action: PaymentService.subscribeToPro})

    useEffect(() => {
        client.query({
            query: gql`
                query checkCurrentUserTier {
                    currentUser {
                        id
                        tier
                        hasCancelled
                    }
                }`,
            fetchPolicy: "no-cache"
        }).then(({data, error, loading}) => {
            if(error) {
                console.error("Error fetching current user:", error);
                Auth.logout();
            }

            if(data.currentUser.tier !== "BASIC"){
                setAction({
                    name: "Manage Subscription",
                    action: PaymentService.manageSubscription
                })
            }

            setIsLoading(false);
        })
    }, []);

    if(isLoading) return <LoadingPage title={"loading account data"}/>

    return (
        <main className={"pro"}>
            <div className="content">
                <h1>Thank you for choosing Shotly Pro!</h1>
                <p>You will get access to unlimited Shotlists and Collaborators.</p>
                <div className="buttons">
                    <a className={"outlined"} href={"/dashboard"}>To your Dashboard</a>
                    <button className={"filled"} onClick={action.action}>{action.name}</button>
                </div>
            </div>
        </main>
    );
}