"use client";

import {ApolloLink, from, HttpLink} from "@apollo/client";
import {
    ApolloNextAppProvider,
    ApolloClient,
    InMemoryCache,
} from "@apollo/client-integration-nextjs";
import auth from "@/Auth"
import {setContext} from "@apollo/client/link/context"
import {onError} from "@apollo/client/link/error"
import {Config} from "@/util/Utils"

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
        if (graphQLErrors)
            graphQLErrors.forEach(({ message, locations, path }) =>
                console.error(`[GraphQL error]: Message: ${message}, Path: ${path}`)
            );

        if(networkError) {
            console.error("networkError", networkError)
            if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/notAllowed';
                }
            }
        }
    });

    return new ApolloClient({
        link: from([authLink, httpLink, errorLink]),
        cache: new InMemoryCache()
    })
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