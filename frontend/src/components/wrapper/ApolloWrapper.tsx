"use client";

import {from, HttpLink, Observable} from "@apollo/client";
import {
    ApolloNextAppProvider,
    ApolloClient,
    InMemoryCache,
} from "@apollo/client-integration-nextjs";
import auth from "@/Auth"
import {setContext} from "@apollo/client/link/context"
import {onError} from "@apollo/client/link/error"
import Config from "@/util/Config"
import {ShotlyErrorCode} from "@/util/Types"
import React from "react"

export function makeClient() {
    const httpLink = new HttpLink({
        uri: Config.backendURL + "/graphql",
        fetchOptions: {
            // you can pass additional options that should be passed to `fetch` here,
            // e.g. Next.js-related `fetch` options regarding caching and revalidation
            // see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
        },
        // you can override the default `fetchOptions` on a per query basis
        // via the `context` property on the options passed as a second argument
        // to an Apollo Client data fetching hook, e.g.:
        // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { ... }}});
    });

    /*return new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink,
    });*/

    const authLink = setContext(async (_, {headers}) => {
        const token = await auth.getIdToken()
        // return the headers to the context so httpLink can read them
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : "",
            }
        }
    })

    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            const error = graphQLErrors[0];

            if (error?.extensions?.type != 'SHOTLY_EXCEPTION') {
                console.log("unkown exception - going to error page", error)
                //redirectToServerError()
            } else {
                switch (error?.extensions?.code as ShotlyErrorCode) {
                    case ShotlyErrorCode.ACCOUNT_DEACTIVATED:
                        if (window) {
                            window.location.href = '/userDeactivated'
                        }
                        break
                }
            }
        }
        if (networkError) {
            if (networkError.name === 'AbortError') {
                redirectToServerError()
            }

            if (networkError.message.includes("Failed to fetch") || (networkError as any).code === 'ECONNREFUSED') {
                redirectToServerError()
            }
        }
    });

    return new ApolloClient({
        link: from([authLink, errorLink, httpLink]),
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                errorPolicy: "all",
            },
            query: {
                errorPolicy: "all",
            },
            mutate: {
                errorPolicy: "all",
            },
        },
    })
}

function redirectToServerError() {
    if (typeof window !== 'undefined') {
        window.location.replace('/serverError');
    }
}

export const apolloClient = makeClient();

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            {children}
        </ApolloNextAppProvider>
    );
}