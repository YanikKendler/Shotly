import {ReactNode} from "react"
import Link from "next/link"
import Wordmark from "@/components/logo/wordmark"
import "./simplePage.scss"
import {House} from "lucide-react"
import Iconmark from "@/components/logo/iconmark"

export default function SimplePage({
    children,
    className
}: {
    children: ReactNode
    className?: string
}){
    return (
        <main className={`simplePage ${className || ""}`}>
            <nav>
                <div className="left">
                    <Link href={"/public"}><Iconmark/>Home</Link>
                </div>
                <Link href={"/public"} className={"middle"}><Wordmark/></Link>
                <div className="right">
                    <Link href={"/dashboard"}><House size={16} strokeWidth={2.5}/>Dashboard</Link>
                </div>
            </nav>
            <div className="content">
                {children}
            </div>
        </main>
    )
}