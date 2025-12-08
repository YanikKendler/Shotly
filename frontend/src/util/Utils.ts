import {wuText} from "@yanikkendler/web-utils/dist"
import {ThemeConfig} from "react-select"
import {ShotlistOrTemplate} from "@/util/Types"
import {ShotlistDto} from "../../lib/graphql/generated"
import {NetworkStatus} from "@apollo/client"
import {UserSettings} from "@/components/dialogs/accountDialog/accountDialog"

export interface fontSizeBreakpoint {
    length: number
    fontSize: number
}

export type BuildMode = "dev" | "prod-deployment" | "dev-deployment"

export class Config {
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
}

export default class Utils {
    static orderShotlistsOrTemplatesByName(a: ShotlistOrTemplate, b: ShotlistOrTemplate) {
        if(!a.name) return 1
        if(!b.name) return -1

        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    }

    static oderShotlistsByChangeDate(a: ShotlistDto, b: ShotlistDto) {
        if(!a.editedAt) return -1
        if(!b.editedAt) return 1

        if (a.editedAt < b.editedAt) {
            return 1
        }
        if (a.editedAt > b.editedAt) {
            return -1
        }
        return 0
    }

    //AI generated
    static numberToShotLetter(shotNum: number, sceneNum: number): string {
        if (shotNum < 0) {
            throw new Error('Number must be non-negative');
        }

        let shotLetter = "##"

        if (Utils.getUserSettingsFromLocalStorage().shotNumberingAfterZ == "repeating") {
            const cycle = Math.floor(shotNum / 26) + 1;

            // Determine position within the cycle (0-25)
            const position = shotNum % 26;

            // Get the base letter using wuText.numberToLetter (0->A, 1->B, etc.)
            const letter = wuText.numberToLetter(position);

            // Repeat the letter 'cycle' times
            shotLetter = letter.repeat(cycle);
        } else {
            let result = '';
            let n = shotNum;

            while (n >= 0) {
                // Get the current letter using wuText.numberToLetter
                const remainder = n % 26;
                result = wuText.numberToLetter(remainder) + result;

                // Move to the next position
                n = Math.floor(n / 26) - 1;

                // Stop if we've processed all digits
                if (n < 0) break;
            }

            shotLetter = result;
        }

        if(Utils.getUserSettingsFromLocalStorage().displaySceneNumbersNextToShotNumbers) {
            shotLetter = `${sceneNum + 1}${shotLetter}`
        }

        return shotLetter;
    }

    static clampFontSizeByTextLength(text: string, bottom: fontSizeBreakpoint, top: fontSizeBreakpoint){
        if(text.length <= bottom.length) {
            return bottom.fontSize
        } else if(text.length >= top.length) {
            return top.fontSize
        } else {
            const ratio = (text.length - bottom.length) / (top.length - bottom.length)
            return bottom.fontSize + (top.fontSize - bottom.fontSize) * ratio
        }
    }

    static defaultQueryResult = {
        data: {},
        loading: true,
        errors: undefined,
        networkStatus: NetworkStatus.loading
    }

    static reorderArray(array: any[], startIndex:number, endIndex:number) {
        const result = Array.from(array)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)
        return result
    }

    static getUserSettingsFromLocalStorage(): UserSettings {
        const settingsString = localStorage.getItem(Config.localStorageKey.userSettings)
        if(settingsString) {
            return JSON.parse(settingsString)
        }

        return {
            displaySceneNumbersNextToShotNumbers: false,
            saveExportSettingsInLocalstorage: false,
            shotNumberingAfterZ: "repeating"
        }
    }
}

export const reactSelectTheme: ThemeConfig = (theme) => ({
    ...theme,
    colors: {
        ...theme.colors,
        primary: 'var(--accent)',
        primary25: 'var(--accent-90)',
        primary50: 'var(--accent-80)',
        primary75: 'var(--accent-60',
    },
})