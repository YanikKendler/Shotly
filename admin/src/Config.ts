export default class Config {
    static readonly mode: "prod" | "dev" = "dev"

    static readonly backendURL =
        this.mode == 'prod' ? 'https://api.shotly.at' : 'http://localhost:8080'

    static readonly frontendURL =
        this.mode == 'prod'
            ? 'https://admin.shotly.at'
            : 'http://localhost:3000'

    static readonly localStorageKey = {
        isLoggedIn: 'shotly-admin-is-logged-in',
    }
}