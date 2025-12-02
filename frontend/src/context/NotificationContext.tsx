"use client";

import {createContext} from "react"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {NotificationSettings} from "@/components/feedback/notification/notification"

export const NotificationContext = createContext<{
    notify: (settings: NotificationSettings) => void;
}>({
    notify: () => {},
});