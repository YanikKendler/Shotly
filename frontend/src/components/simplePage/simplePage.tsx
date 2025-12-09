import {ReactNode} from "react"
import Link from "next/link"
import Wordmark from "@/components/wordmark"
import "./simplePage.scss"
import {House} from "lucide-react"
import Iconmark from "@/components/iconmark"

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
                    <Link href={"/"}><Iconmark/>Home</Link>
                </div>
                <Wordmark/>
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