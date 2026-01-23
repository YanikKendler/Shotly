import Config from "@/util/Config"
import Auth from "@/Auth"

//TODO error handling and user notifications

export default class PaymentService {
    static manageSubscription() {
        fetch(`${Config.backendURL}/stripe/create-portal-session`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Auth.getIdToken()}`
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server returned status ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                window.location.href = data.url;
            })
            .catch(err => {
                //TODO notification
                console.error("Error:", err)
            });
    }

    static subscribeToPro() {
        fetch(`${Config.backendURL}/stripe/create-checkout-session`, {
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
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server returned status ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                window.location.href = data.url;
            })
            .catch(err => {
                //TODO notification
                console.error("Error:", err)
            });
    }
}