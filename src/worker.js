// import Webtoon from "./webtoon.js";
import {
  injectIncomingComments,
  hideDeleteButtons,
  hideRating,
  reorderHeader,
  roundSub,
} from "./inject.js";

const INTERVAL_DELAY_MS = 1000 * 60 * 30; // 30 minutes

const STORAGE_COUNTER_NAME = "cs_new_counter";

// =====================NOTE===================== //
// Make sure to sync this with popup > setting.ts //
// TODO: globalize these to share with popup      //
// ---------------------------------------------- //
const STORAGE_SETTING_NAME = "cs_settings";
let setting = {
  incomingComments: true,
  authToken: false,
  hideDelete: true,
  reorderHeader: false,
  hideRating: false,
  roundSub: false,
};
// ============================================== //

async function getSetting() {
  const parseItem = (item) => {
    console.log(`Parseing item: ${item.key} (value=${item.value})`);
    if (
      "key" in item &&
      "value" in item &&
      Object.keys(setting).includes(item.key)
    ) {
      setting[item.key] = item.value;
    }
  };

  if (chrome.storage) {
    console.log("Getting setting from chrome");
    await chrome.storage.sync.get(STORAGE_SETTING_NAME).then((items) => {
      if (STORAGE_SETTING_NAME in items) {
        items[STORAGE_SETTING_NAME].forEach(parseItem);
      }
    });
  } else {
    // perhaps check localStorage
    console.log("Getting setting from localStorage");
    const stored = localStorage.getItem(STORAGE_SETTING_NAME);
    if (stored) {
      const storedJson = JSON.parse(stored);
      if (Array.isArray(storedJson)) {
        storedJson.forEach(parseItem);
      }
    }
  }

  console.log(setting);
}

// # Note
// >> For each Series
// >> >> For each episodes
// >> >> >> FirstNewComment => storage.sync
// >> >> >> LastNewComment => storage.sync
// >> >> >> NewCommentCount => storage.sync

async function getCounter() {
  return chrome.storage.sync.get(STORAGE_COUNTER_NAME).then((items) => {
    if (STORAGE_COUNTER_NAME in items) {
      return items[STORAGE_COUNTER_NAME];
    }
    return null;
  });
}

async function setCounter(value) {
  if (typeof value !== "number") {
    throw new Error(`TypeError: new counter value must be a number.`);
  }
  return chrome.storage.sync.set({ [STORAGE_COUNTER_NAME]: payload });
}

async function addCounter(value) {
  if (typeof value !== "number") {
    throw new Error(`TypeError: value must be a number.`);
  }
  return chrome.storage.sync
    .get(STORAGE_COUNTER_NAME)
    .then((items) => {
      if (STORAGE_COUNTER_NAME in items) {
        const value = items[STORAGE_COUNTER_NAME];
        if (typeof value === "number") {
          return value + payload;
        }
      }
      return null;
    })
    .then((value) => {
      if (value) {
        chrome.storage.sync.set({ [STORAGE_COUNTER_NAME]: value });
      } else {
        throw new Error("ParseError: Unable to parse counter from storage");
      }
    });
}

async function resetCounter() {
  return chrome.storage.sync.set({ [STORAGE_COUNTER_NAME]: 0 });
}

// Main Function for applying extension changes
async function extendWebtoons() {
  const currUrl = document.location.href;

  const reWebtoons = new RegExp(/^https\:\/\/www\.webtoons\.com\/.*$/, "i");
  const reComments = new RegExp(
    /^https\:\/\/www\.webtoons\.com\/.*\/mycomment/,
    "i"
  );
  const reDashboard = new RegExp(
    /^https\:\/\/www\.webtoons\.com\/.*\/challenge\/dashboard/,
    "i"
  );

  if (currUrl.match(reWebtoons)) {
    if (setting.reorderHeader) {
      reorderHeader();
    }
    if (setting.hideRating) {
      hideRating();
    }
    if (setting.roundSub) {
      roundSub();
    }
  }

  if (currUrl.match(reDashboard) && setting.hideDelete) {
    hideDeleteButtons();
  }

  if (currUrl.match(reComments) && setting.incomingComments) {
    injectIncomingComments();
  }
}

// window.onload = async () => {
//     console.log("Window onload");
//     await getSetting();
//     await extendWebtoons();
// };

// if (chrome.storage) {
//     chrome.storage.sync.onChanged.addListener(async () => {
//         // TODO: Revert "injected" changes without doing reload()
//         await getSetting();
//         window.location.reload();
//         await extendWebtoons();
//     });
// }
async function inject(tabId, tab = null) {
  const url = tab
    ? tab.url || tab.pendingUrl || null
    : await chrome.tabs
        .get(tabId)
        .then((tab) => tab.url || tab.pendingUrl || null);

  if (url === null) {
    throw new Error(`Error: the tab (id=${tabId}) does not contain any url`);
  }

  const reWebtoons = new RegExp(/^https\:\/\/www\.webtoons\.com\/.*$/, "i");
  const reComments = new RegExp(
    /^https\:\/\/www\.webtoons\.com\/.*\/mycomment/,
    "i"
  );
  const reDashboard = new RegExp(
    /^https\:\/\/www\.webtoons\.com\/.*\/challenge\/dashboard/,
    "i"
  );

  if (url.match(reWebtoons)) {
    if (setting.reorderHeader) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: reorderHeader,
      });
    }
    if (setting.hideRating) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: hideRating,
      });
    }
    if (setting.roundSub) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: roundSub,
      });
    }
  }

  if (url.match(reDashboard) && setting.hideDelete) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: hideDeleteButtons,
    });
  }

  if (url.match(reComments) && setting.incomingComments) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: injectIncomingComments,
    });
  }
}

// Inject when navigating through different tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log("onActivated", activeInfo);
  await getSetting();
  inject(activeInfo.tabId);
});

// Inject when the tab is refreshed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log("onUpdate", tabId, changeInfo, tab);
  await getSetting();
  inject(tabId, tab);
});

chrome.storage.sync.onChanged.addListener(async () => {
  // TODO: Revert "injected" changes without doing reload()
  await getSetting();
  chrome.tabs
    .query({
      active: true,
    })
    .then((tabs) => {
      tabs.forEach((tab) => inject(tab?.id, tab));
    });
});
