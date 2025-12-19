import Config from "@/util/Config"
import Auth from "@/Auth"

export default class PaymentService {
    static manageSubscription() {
        fetch(`${Config.backendURL}/stripe/create-portal-session`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Auth.getIdToken()}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                //window.location.href = data.url;
            })
            .catch(err => console.error("Error:", err));
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
            .then(res => res.json())
            .then(data => {
                window.location.href = data.url;
            })
            .catch(err => console.error("Error:", err));
    }
}