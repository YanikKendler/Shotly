import TelemetryDeck from '@telemetrydeck/sdk';
import Config from "@/util/Config"

const getTempUserIdentifier = (): string => {
    if(typeof window === "undefined" || !window.localStorage) {
        return "";
    }

    let identifier = localStorage.getItem("shotly-temp-user-identifier");
    if (!identifier) {
        identifier = crypto.randomUUID();
        localStorage.setItem("shotly-temp-user-identifier", identifier);
    }
    return identifier;
}

export const td = new TelemetryDeck({
    appID: '8542FDD9-23AE-4E22-AA0C-3A912341432C',
    clientUser: getTempUserIdentifier(),
    testMode: Config.mode != "prod-deployment",
});
