import type { SettingItemType, SettingType } from "@popup/interface";
import { STORAGE_CONTENT_SETTING_NAME, STORAGE_WORKER_SETTING_NAME } from "@root/src/shared/global";
import { IS_DEV } from "@shared/global";
import { useEffect, useMemo, useState } from "react";


const defaultSetting: SettingType[] = [
	{
		_type: "setting",
		key: STORAGE_CONTENT_SETTING_NAME,
		text: "",
		value: [
			{
				_type: "settingItem",
				key: "incomingComments",
				desc: "Show incoming comments",
				value: true,
				toolTip:
					"Adds a new tab for incoming comments in the comment section. The \
					outgoing comment list stays the original list from webtoon aside \
					from the additional tab bar in the top.",
			},
			{
				_type: "settingItem",
				key: "hideDelete",
				desc: "Hide delete button",
				value: true,
				toolTip:
					"Hides the delete button from all tiles in the dashboard to avoid \
					accidentally deleting your series.",
			},
			{
				_type: "settingItem",
				key: "reorderHeader",
				desc: "Reorder buttons in header*",
				value: false,
				toolTip:
					"Changes the order of the buttons in the top right corner of the \
					header.",
			},
			{
				_type: "settingItem",
				key: "hideRating",
				desc: "Hide rating",
				value: false,
				toolTip:
					"Hides the rating field from the comic overview page. You can not \
					rate anyone's comic but others can still rate yours!",
			},
			{
				_type: "settingItem",
				key: "roundSub",
				desc: "Round subscribers count to thousand",
				value: false,
				toolTip:
					"Removes last three digits once subscribers count is greater than 1000.",
			},
		],
	}, 
	{
		_type: "setting",
		key: STORAGE_WORKER_SETTING_NAME,
		text: "",
		value: [
			{
				_type: "settingItem",
				key: "showNotification",
				desc: "Show notifcations",
				value: false,
				toolTip:
					"Enables notifications for incoming comments. Requires additional \
					permission.",
			}
		],
	}
];

async function loadSetting(): Promise<SettingType[]> {
	console.log("Loading Setting");
	if (IS_DEV || !chrome.storage) {
		// In dev mode, we use localStorage to store settings
		// In production, we use chrome.storage.sync to store settings

		return defaultSetting.map((item) => {
			const storedItem = localStorage.getItem(item.key);
			if (storedItem) {
				const stored = JSON.parse(storedItem);
				if (
					Array.isArray(stored) &&
					stored.every((v) => v._type === "setting")
				) {
					item.value = item.value.map((defval) => {
						const ex = stored.find(
							(impSetting) => impSetting.key === defval.key,
						);
						if (ex) defval.value = ex.value;
						return defval;
					});
				}
			} 
			return item;
		});
	} else {
		const loaded = defaultSetting.map(async (item) => {
			await chrome.storage.sync.get(item.key).then((storedItems) => {
				if (item.key in storedItems) {
					const stored: SettingItemType[] = storedItems[item.key] satisfies SettingItemType[];
					if (
						Array.isArray(stored) &&
						stored.every((v) => v._type === "settingItem")
					) {
						item.value = item.value.map((defval) => {
							const ex = stored.find(
								(impSetting) => impSetting.key === defval.key,
							);
							if (ex) defval.value = ex.value;
							return defval;
						});
					}
				}
			});
			return item;
		});
		return await Promise.all(loaded);
	}
}

async function saveSetting(settings: SettingType[]) {
	console.log("Saving Setting");
	if (IS_DEV || !chrome.storage) {
		// In dev mode, we use localStorage to store settings
		// In production, we use chrome.storage.sync to store settings
		for (const [storageKey, setting] of Object.entries(settings)) {
			localStorage.setItem(storageKey, JSON.stringify(setting));
		}
	} else {
		const prep: {[key: string]: SettingItemType[] } = {};
		settings.forEach((setting) => {
			prep[setting.key] = setting.value;
		});

		await chrome.storage.sync.set(prep);
	}
}

async function handleWorkerSettingChange(key: string, value: boolean): Promise<boolean> {
	console.log("Handling worker setting change", key);
	
	switch (key) {
		case "showNotification": {
			if (!chrome.permissions) return false;
			if (value === true) {
				// Add notification permission
				return await chrome.permissions.request({
					permissions: ["notifications"]
				}, );
			} else {
				return await chrome.permissions.remove({
					permissions: ["notifications"]
				});
			}
		}
	}

	return true;
}

export function useSetting() {
	const [setting, setSetting] = useState<SettingType[] | null>(null);

	useEffect(() => {
		loadSetting().then((loaded) => setSetting(loaded));
	}, []);

	const updateSetting = async (key: string, value: boolean) => {
		if (setting) {
			const namespace = setting.find((item) => item.value.find(v => v.key === key))?.key;
			if (!namespace) return;

			if (namespace === STORAGE_WORKER_SETTING_NAME) {
				// TODO: Fix issue where permission request closes the popup & doesn't save the new setting
				const result = await handleWorkerSettingChange(key, value);
				if (!result) return;
			}

			const newSetting = setting.map((item) => {
				if (item.key === namespace) {
					item.value = item.value.map((v => {
						if (v.key === key) {
							v.value = value;
						}
						return v;
					}));
				}
				return item;
			});

			setSetting(newSetting);
			saveSetting(newSetting);
		}
	};

	return [setting, updateSetting] as const;
}
