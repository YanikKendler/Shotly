"use client"

import {useNotification} from "@/components/feedback/notification/notification"
import {NotificationContext} from "@/context/NotificationContext"

export default function NotificationWrapper({ children }: { children: React.ReactNode }) {
    const {Notification, notify} = useNotification();

    return (
        <NotificationContext value={{notify}}>
            {children}
            {Notification}
        </NotificationContext>
    )
}