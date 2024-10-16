import { IS_DEV } from "@shared/global";
import { useEffect, useState } from "react";

export function useCounter() {
	const [counter, setCounter] = useState(0);

	const updateCounter = () => {
		// TODO: replace placeholder logic
		setCounter((counter + 1) % (1 + Math.floor(Math.random() * 20)));
	};

	// Initial update
	useEffect(() => {
		updateCounter();
	}, []);

	// TODO: Move badget text update to service worker for update outside of popup
	// Sync up Badge Text on counter change
	useEffect(() => {
		if (!IS_DEV && chrome.action) {
			if (counter > 0) {
				// TODO: set badge background as well
				chrome.action.setBadgeText({ text: `${counter}` });
			} else {
				chrome.action.setBadgeText({ text: "" });
			}
		}
	}, [counter]);

	return [counter, updateCounter] as const;
}
