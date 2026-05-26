import TelemetryDeck, {TelemetryDeckPayload} from '@telemetrydeck/sdk';
import Config from "@/Config"
import {BUILD_INFO} from "../../buildinfo"
import Utils from "@/utility/Utils"
import {wuText} from "@yanikkendler/web-utils/dist"

export default class Analytics {
    private static getTempUserIdentifier = (): string => {
        if(typeof window === "undefined" || !window.localStorage) {
            return "";
        }

        let identifier = localStorage.getItem(Config.localStorageKey.userIdentifier);

        //initially it was planned to use the userId as identifier, but its fine to just use the LS permanently
        //TODO remove this after 07 26
        if(!identifier || identifier == "") {
            identifier = localStorage.getItem("shotly-temp-user-identifier");
        }

        if (!identifier || identifier == "") {
            identifier = crypto.randomUUID();
            localStorage.setItem(Config.localStorageKey.userIdentifier, identifier);
        }
        return identifier;
    }

    private static getClientOS() {
        const ua = navigator.userAgent;
        if (ua.indexOf("Win") !== -1) return "Windows";
        if (ua.indexOf("Mac") !== -1) return "macOS";
        if (ua.indexOf("Linux") !== -1) return "Linux";
        if (ua.indexOf("Android") !== -1) return "Android";
        if (ua.indexOf("like Mac") !== -1) return "iOS";
        return "Unknown";
    }

    private static getBrowserMetadata() {
        if (typeof window === 'undefined') return {};

        const language = navigator.language || '';

        const orientation = window.matchMedia("(orientation: portrait)").matches ? "Portrait" : "Landscape"
        const touch = window.matchMedia("(pointer: coarse)").matches ? "Touch" : "Mouse"

        return {
            'TelemetryDeck.Device.platform': 'Web',
            'TelemetryDeck.Device.operatingSystem': Analytics.getClientOS(),
            'TelemetryDeck.Device.screenResolutionWidth': window.screen.width.toString(),
            'TelemetryDeck.Device.screenResolutionHeight': window.screen.height.toString(),
            'TelemetryDeck.Device.timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'TelemetryDeck.Device.region': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'TelemetryDeck.Device.orientation': orientation,
            'TelemetryDeck.Device.modelName': touch,
            'TelemetryDeck.UserPreference.language': language,
        };
    }

    private static getColorScheme() {
        const userSettingTheme = localStorage.getItem(Config.localStorageKey.theme)
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'

        if(userSettingTheme == null || userSettingTheme == "system"){
            return systemTheme
        }

        return wuText.upperOrLowerRange(userSettingTheme, 0, 0)
    }

    private static td = new TelemetryDeck({
        appID: '8542FDD9-23AE-4E22-AA0C-3A912341432C',
        clientUser: Analytics.getTempUserIdentifier(),
        testMode: Config.mode != "prod-deployment",
    });

    public static signal (type: string, payload: TelemetryDeckPayload = {}) {
        Analytics.td.signal(
            type,
            {
                ...payload,
                ...Analytics.getBrowserMetadata(),
                "TelemetryDeck.AppInfo.version": BUILD_INFO.version,
                "TelemetryDeck.AppInfo.buildNumber": BUILD_INFO.buildTime,

                "TelemetryDeck.UserPreference.colorScheme": Analytics.getColorScheme(),
            }
        )
    }
}