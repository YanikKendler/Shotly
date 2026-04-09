import {Client, createClient} from 'graphql-http'
import Config from './Config'
import authService from './AuthService'
import {Mutation, Query} from './generatedTypes'

export interface QueryResult {
    data: Query
    errors?: any[]
}

export interface MutationResult {
    data: Mutation
    errors?: unknown[]
}

export class gqlClient {
    private static client: Client | null = null

    public static async get(): Promise<Client> {
        if (this.client) {
            return this.client
        }

        await authService.silentAuth()

        this.client = createClient({
            url: Config.backendURL + '/graphql',
            headers: {
                Authorization: `Bearer ${authService.getIdToken()}`,
            },
        })

        return this.client
    }
}