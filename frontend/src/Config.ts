import {BuildMode} from "@/util/Utils"

export default class Config {
    static readonly mode: BuildMode =
        process.env.NODE_ENV == "development" ?
            "dev" :
            process.env.NEXT_PUBLIC_BUILD_FOR_PROD == "true" ?
                "prod-deployment" :
                "dev-deployment"

    //for testing
    static readonly OVERRIDE_INTRO_CHECKS = false && this.mode != "prod-deployment"

    static readonly backendURL =
        Config.mode == "dev" ?
            "http://localhost:8080" :
            Config.mode == "prod-deployment" ?
                "https://api.shotly.at" :
                "https://shotly-backend-development-566625943723.europe-west1.run.app"

    static readonly websocketURL =
        Config.mode == "dev" ?
            "ws://localhost:8080" :
            Config.mode == "prod-deployment" ?
                "wss://api.shotly.at/" :
                "wss://shotly-backend-development-566625943723.europe-west1.run.app/"

    static readonly frontendURL =
        Config.mode == "dev" ?
            "http://localhost:3000" :
            Config.mode == "prod-deployment" ?
                "https://shotly.at" :
                "https://shotly-frontend-development-566625943723.europe-west1.run.app"


    static readonly localStorageKey = {
        theme: "shotly-theme",
        //I guess this could be regarded as a sin.. non constant value in a config file or whatever but this actually
        //enforces the convention more nicely because its accessed in the same place as all other local storage keys
        //but then throws an error if its used as a value instead of a function call and requires the shotlistId to be passed
        exportSettings: (shotlistId: string) => "shotly-export-settings_" + shotlistId,
        userSettings: "shotly-user-settings",
        dashboardTourCompleted: "shotly-dashboard-tour-completed",
        shotlistTourCompleted: "shotly-shotlist-tour-completed",
        templateTourCompleted: "shotly-template-tour-completed",
        isLoggedIn: "shotly-is-logged-in",
        userIdentifier: "shotly-user-identifier"
    }

    static readonly loadingMessage = {
        authGetUser: "Logging you in...",
        redirect: "You will be redirected shortly...",
        login: "Logging you in...",
    }

    static readonly constant = {
        maxCollaboratorsInFreePlan: 5
    }
}