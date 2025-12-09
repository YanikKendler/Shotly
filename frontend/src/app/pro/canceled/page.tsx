import "../pro.scss"
import SimplePage from "@/components/simplePage/simplePage"
import {Home} from "lucide-react"
import Link from "next/link"

/**
 * Users are sent here when they cancel a purchase from the stripe checkout session
 * @constructor
 */
export default function ProPurchaseCancel(){
    return (
        <SimplePage>
            <h1>Unsure if Shotly is right for you?</h1>
            <p>Test it with the basic tier - free forever</p>

            <div className="buttons">
                <Link href="/pro" className={"outlined"}>Subscribe to Shotly Pro</Link>
                <Link href="/dashboard" className={"filled"}>Continue with Basic</Link>
            </div>
        </SimplePage>
    );
}