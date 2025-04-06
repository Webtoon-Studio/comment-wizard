import { MdOutlineTheaters } from "react-icons/md";

type ThisNotificationOptions = Omit<chrome.notifications.NotificationOptions, "title" | "message">;

interface Notification {
    appIcon: string;
    current?: string;
    inform: (title: string, message: string, options?: ThisNotificationOptions) => void;
    error: (title: string, message: string, options?: ThisNotificationOptions) => void;
}

export const notification: Notification = {
    appIcon: chrome.runtime.getURL("asset/icon.png"),
    inform: async function (title: string, message: string, options?: ThisNotificationOptions) {
        if (!chrome.permissions || !chrome.notifications) return;
        const permit = await chrome.permissions.contains({
            permissions: ["notifications"]
        });
        if (!permit) return;

        const {
            iconUrl,
            requireInteraction = true,
            silent = true,
            ...otherOptions
        } = options ?? {};

        let dlIconUrl = undefined;
        if (iconUrl) {
            try {
                const resp = await fetch(iconUrl);
                const blob = await resp.blob();
    
                dlIconUrl = URL.createObjectURL(blob);
            } catch (e) {
                // do nothing
            }
        }

        chrome.notifications.create({
            type: "basic",
            iconUrl: dlIconUrl ?? this.appIcon,
            title,
            message,
            requireInteraction,
            silent,
            ...otherOptions
        }, (nid: string) => {
            this.current = nid;
        });
    },
    error: async function (title: string, message: string, options?: ThisNotificationOptions) {
        if (!chrome.permissions || !chrome.notifications) return;
        const permit = await chrome.permissions.contains({
            permissions: ["notifications"]
        });
        if (!permit) return;

        const {
            iconUrl,
            requireInteraction = true,
            silent = true,
            ...otherOptions
        } = options ?? {};

        chrome.notifications.create({
            type: "basic",
            iconUrl: iconUrl ?? this.appIcon,
            title,
            message,
            requireInteraction,
            silent,
            ...otherOptions
        })
        
    }
}