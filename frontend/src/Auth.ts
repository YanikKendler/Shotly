import auth0, {Auth0DecodedHash, Auth0ParseHashError, WebAuth} from 'auth0-js';
import Config from "@/Config"
import {errorNotification} from "@/service/NotificationService"
import {td} from "@/service/Analytics"
import {wuConstants, wuGeneral} from "@yanikkendler/web-utils/dist"

export interface AuthUser {
    email: string;
    sub: string;
    isSocial?: boolean;
}

interface CustomAuthResult extends Auth0DecodedHash {
    appState?: {
        targetUrl?: string;
    };
}

class Auth {
    private auth0: WebAuth
    private idToken: string = "no-token"
    private authUser: AuthUser | null = null
    private expiresAt: number = 0

    constructor() {
        this.auth0 = new auth0.WebAuth({
            domain: 'login.shotly.at',
            clientID: '4FPKDtlCQjAToOwAEiG6ZrL0eW2UXlx4',
            responseType: 'id_token token',
            redirectUri: Config.frontendURL + '/callback',
            audience: 'https://dev-pvlm4i5qpteni14h.us.auth0.com/api/v2/',
            scope: 'openid profile email',
            overrides: {
                __tenant: "dev-pvlm4i5qpteni14h",
                __token_issuer: 'https://login.shotly.at/'
            },
        })

        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.handleAuthentication = this.handleAuthentication.bind(this)
        this.isAuthenticated = this.isAuthenticated.bind(this)
        this.silentAuth = this.silentAuth.bind(this)
    }

    login() {
        this.auth0.authorize()
    }

    register() {
        this.auth0.authorize({
            screen_hint: "signup"
        });
    }

    loginForPro(){
        this.auth0.authorize({
            appState: { targetUrl: '/pro' }
        });
    }

    logout() {
        localStorage.setItem(Config.localStorageKey.isLoggedIn, JSON.stringify(false));
        this.auth0.logout({
            returnTo: Config.frontendURL,
        });
    }

    getIdToken() {
        return this.idToken
    }

    getUser() {
        return this.authUser
    }

    handleAuthentication() {
        return new Promise<string>((resolve, reject) => {
            this.auth0.parseHash({ hash: window.location.hash }, (error: Auth0ParseHashError | null, authResult: CustomAuthResult | null) => {
                if (error) {
                    console.error(error)
                    errorNotification({
                        title: "Authentication failed",
                        sub: "Please reload the page and log in again."
                    })
                    reject(error)
                }

                if(!authResult) {
                    errorNotification({
                        title: "Authentication failed",
                        sub: "Please reload the page and log in again."
                    })
                    return reject("authResult is null")
                }

                this.setSession(authResult)

                if(!authResult.accessToken) {
                    errorNotification({
                        title: "Authentication failed",
                        sub: "Please reload the page and log in again."
                    })
                    return reject("missing accessToken")
                }

                localStorage.setItem(Config.localStorageKey.hasLoggedInBefore, JSON.stringify(true))

                this.auth0.client.userInfo(authResult.accessToken, (err, user) => {
                    resolve(authResult.appState?.targetUrl || '/dashboard');
                })
            })
        })
    }

    setSession(authResult: Auth0DecodedHash) {
        if(!authResult || !authResult.idToken || !authResult.expiresIn) {
            console.error("missing id token")
            errorNotification({
                title: "Authentication failed",
                sub: "Please reload the page and log in again."
            })
            return
        }

        this.idToken = authResult.idToken;

        this.expiresAt = (authResult.expiresIn * 1000) + Date.now();

        if(!authResult.idTokenPayload.sub || !authResult.idTokenPayload.email || !authResult.idTokenPayload.name){
            console.error("missing data in id token payload")
            errorNotification({
                title: "Authentication failed",
                sub: "Please reload the page and log in again."
            })
            return
        }

        //td.clientUser = authResult.idTokenPayload.sub

        this.authUser = {
            email: authResult.idTokenPayload.email,
            sub: authResult.idTokenPayload.sub,
            isSocial: authResult.idTokenPayload.sub.startsWith("google-oauth2|")
        }

        localStorage.setItem(Config.localStorageKey.isLoggedIn, JSON.stringify(true))
    }

    async silentAuth(): Promise<boolean> {
        if (!this.isAuthenticated()) return false;

        if (typeof document !== 'undefined' && !document.hasFocus()) return false;

        const buffer = wuConstants.Time.msPerMinute * 30;
        if (this.idToken !== "no-token" && Date.now() < (this.expiresAt - buffer)) {
            return false;
        }

        return new Promise<boolean>((resolve, reject) => {
            this.auth0.checkSession({}, (err, authResult) => {
                if (err) {
                    localStorage.setItem(Config.localStorageKey.isLoggedIn, "false");
                    return reject(err);
                }
                this.setSession(authResult);
                resolve(true);
            });
        });
    }

    isAuthenticated() {
        return JSON.parse(localStorage.getItem(Config.localStorageKey.isLoggedIn) || "false");
    }

    hasLoggedInBefore() {
        return JSON.parse(localStorage.getItem(Config.localStorageKey.hasLoggedInBefore) || "false");
    }
}

const auth = new Auth();

export default auth;
