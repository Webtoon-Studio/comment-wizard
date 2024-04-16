import { useEffect, useState } from "react";
import { ISetting } from "@popup/src/interface";

const STORAGE_SETTING_NAME = "cs_settings";

const defaultSetting: ISetting[] = [
  {
    iType: "setting",
    key: "incomingComments",
    desc: "Show incoming comments",
    value: true,
    toolTip:
      "Adds a new tab for incoming comments in the comment section. The \
            outgoing comment list stays the original list from webtoon aside \
            from the additional tab bar in the top.",
  },
  {
    iType: "setting",
    key: "hideDelete",
    desc: "Hide delete button",
    value: true,
    toolTip:
      "Hides the delete button from all tiles in the dashboard to avoid \
            accidentally deleting your series.",
  },
  {
    iType: "setting",
    key: "reorderHeader",
    desc: "Reorder buttons in header*",
    value: false,
    toolTip:
      "Changes the order of the buttons in the top right corner of the \
            header.",
  },
  {
    iType: "setting",
    key: "hideRating",
    desc: "Hide rating",
    value: false,
    toolTip:
      "Hides the rating field from the comic overview page. You can not \
            rate anyone's comic but others can still rate yours!",
  },
  {
    iType: "setting",
    key: "roundSub",
    desc: "Round subscribers count to thousand",
    value: false,
    toolTip:
      "Removes last three digits once subscribers count is greater than 1000.",
  },
];

async function loadSetting(): Promise<ISetting[]> {
  console.log("Loading Setting");
  if (import.meta.env.DEV || !chrome.storage) {
    const storedItem = localStorage.getItem(STORAGE_SETTING_NAME);
    if (storedItem) {
      const importedSetting = JSON.parse(storedItem);
      if (
        Array.isArray(importedSetting) &&
        importedSetting.every((v) => v.iType === "setting")
      ) {
        return defaultSetting.map((defSetting) => {
          const impSetting = importedSetting.find(
            (impSetting) => impSetting.key === defSetting.key
          );
          if (impSetting) defSetting.value = impSetting.value;
          return defSetting;
        });
      }
    }
    return defaultSetting;
  } else {
    return (
      (await chrome.storage.sync.get(STORAGE_SETTING_NAME).then((items) => {
        if (STORAGE_SETTING_NAME in items) {
          const importedSetting: ISetting[] = items[
            STORAGE_SETTING_NAME
          ] satisfies ISetting[];
          return defaultSetting.map((defSetting) => {
            const impSetting = importedSetting.find(
              (impSetting) => impSetting.key === defSetting.key
            );
            if (impSetting) defSetting.value = impSetting.value;
            return defSetting;
          });
        }
      })) || defaultSetting
    );
  }
}

function saveSetting(setting: ISetting[]) {
  console.log("Saving Setting");
  if (import.meta.env.DEV || !chrome.storage) {
    localStorage.setItem(STORAGE_SETTING_NAME, JSON.stringify(setting));
  } else {
    chrome.storage.sync.set({
      [STORAGE_SETTING_NAME]: setting,
    });
  }
}

export function useSetting() {
  const [setting, setSetting] = useState<ISetting[] | null>(null);

  useEffect(() => {
    loadSetting().then((loaded) => setSetting(loaded));
  }, []);

  const updateSetting = (key: string, value: boolean) => {
    if (setting) {
      let newSetting = setting.map((item) => {
        if (item.key === key) {
          item.value = value;
        }
        return item;
      });
      setSetting(newSetting);
      saveSetting(newSetting);
    }
  };

  return [setting, updateSetting] as const;
}
