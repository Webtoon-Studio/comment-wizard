import { useEffect, useState } from "react";

export default function useCounter() {
    const [counter, setCounter] = useState(0);

    const updateCounter = function() {
        // TODO: replace placeholder logic
        setCounter((counter + 1) + (1 + Math.floor(Math.random() * 20)));
    }

    // Initial update
    useEffect(() => {
        setInterval(
            updateCounter,
            500
        )
    }, []);

    // TODO: Move badget text update to service worker for update outside of popup
    // Sync up Badge Text on counter change
    useEffect(() => {
        if (import.meta.env.PROD && chrome.action) {
            if (counter > 0) {
                // TODO: set badge background as well
                chrome.action.setBadgeText({text: `${counter}`});
            } else {
                chrome.action.setBadgeText({text: ""});
            }
        }
    }, [counter]);


    return [counter, updateCounter] as const;
}