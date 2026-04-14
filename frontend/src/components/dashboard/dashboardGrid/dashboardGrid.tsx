import "./dashboardGrid.scss"
import {ReactNode} from "react"

export default function DashboardGrid({children}: {children: ReactNode}) {
    return <div className="dashboardGrid">
        {children}
    </div>
}