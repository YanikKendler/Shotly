import {BuildMode} from "@/util/Utils"

export default class Config {
    static readonly mode: BuildMode =
        process.env.NODE_ENV == "development" ?
            "dev" :
            process.env.NEXT_PUBLIC_BUILD_FOR_PROD == "true" ?
                "prod-deployment" :
                "dev-deployment"

    static readonly backendURL =
        Config.mode == "dev" ?
            "http://localhost:8080" :
            Config.mode == "prod-deployment" ?
                "https://api.shotly.at" :
                "https://shotly-backend-development-566625943723.europe-west1.run.app";

    static readonly websocketURL =
        Config.mode == "dev" ?
            "ws://localhost:8080" :
            Config.mode == "prod-deployment" ?
                "wss://api.shotly.at/" :
                "wss://shotly-backend-development-566625943723.europe-west1.run.app/";

    static readonly frontendURL =
        Config.mode == "dev" ?
            "http://localhost:3000" :
            Config.mode == "prod-deployment" ?
                "https://shotly.at" :
                "https://shotly-frontend-development-566625943723.europe-west1.run.app";

    static readonly localStorageKey = {
        theme: "shotly-theme",
        exportSettings: "shotly-export-settings",
        userSettings: "shotly-user-settings",
        dashboardTourCompleted: "shotly-dashboard-tour-completed",
        shotlistTourCompleted: "shotly-shotlist-tour-completed",
        templateTourCompleted: "shotly-template-tour-completed",
        isLoggedIn: "shotly-is-logged-in"
    }

    static readonly loadingMessage = {
        authGetUser: "Logging you in...",
    }

    static readonly constant = {
        maxCollaboratorsInFreePlan: 5
    }
}