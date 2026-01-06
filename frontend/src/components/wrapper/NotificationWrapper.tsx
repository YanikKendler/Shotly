"use client"

import {NotificationContext} from "@/context/NotificationContext"
import {Notification, NotificationSettings} from "@/components/feedback/notification/notification"
import {useState} from "react"

export default function NotificationWrapper({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationSettings[]>([])

    const notify = (settings: NotificationSettings) => {
        setNotifications(n => [...n, settings])
    }

    return (
        <NotificationContext value={{notify}}>
            {children}
            {notifications.map((n, i) => <Notification key={i} settings={n}/>)}
        </NotificationContext>
    )
}