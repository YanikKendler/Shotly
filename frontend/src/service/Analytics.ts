import TelemetryDeck from '@telemetrydeck/sdk';
import Config from "@/Config"

const getTempUserIdentifier = (): string => {
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

export const td = new TelemetryDeck({
    appID: '8542FDD9-23AE-4E22-AA0C-3A912341432C',
    clientUser: getTempUserIdentifier(),
    testMode: Config.mode != "prod-deployment",
});
