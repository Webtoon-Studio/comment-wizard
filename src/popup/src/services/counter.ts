import { useEffect, useState } from "react";

export default function useCounter() {
    const [counter, setCounter] = useState(0);

    const updateCounter = function() {
        // TODO: replace placeholder logic
        setCounter((counter + 1) % (1 + Math.floor(Math.random() * 20)));
    }

    // Initial update
    useEffect(() => {
        updateCounter()
    }, []);

    // Sync up Badge Text on counter change
    useEffect(() => {
        if (import.meta.env.PROD && chrome.action) {
            if (counter > 0) {
                // TODO: set badge background as well
                chrome.action.setBadgeText({text: `${counter}`});
            }
        }
    }, [counter]);


    return [counter, updateCounter] as const;
}