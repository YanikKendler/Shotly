import Config from "@/Config"
import Auth from "@/Auth"
import {errorNotification} from "@/service/NotificationService"

export default class PaymentService {
    static async manageSubscription() {
        const res = await fetch(`${Config.backendURL}/stripe/create-portal-session`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Auth.getIdToken()}`
            }
        })

        const data = await res.json();

        if (!res.ok) {
            errorNotification({
                message: data.message,
                title: "Could not redirect to billing portal",
                sub: "Please contact yanik@shotly.at."
            })
            return
        }

        window.location.href = data.url
    }

    static async subscribeToPro() {
        const res = await fetch(`${Config.backendURL}/stripe/create-checkout-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${Auth.getIdToken()}`
            },
            body: JSON.stringify({
                lookupKey: "shotly_pro_monthly"
            }),
        })

        const data = await res.json();

        if (!res.ok) {
            errorNotification({
                message: data.message,
                title: "Could not redirect to billing portal",
                sub: "Please contact yanik@shotly.at."
            })
            return
        }

        window.location.href = data.url
    }
}