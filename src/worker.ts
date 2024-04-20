// import Webtoon from "./webtoon.js";

// =============================== GLOBAL VARIABLES =============================== //
const STORAGE_COUNTER_NAME = "cs-new-counter";
const STORAGE_SERIES_NAME = "cs-series-items";

const GETTING_SERIES_ALARM_NAME = "alarm-getting-series-delay";
const GETTING_SERIES_DELAY_MINS = 5;
const GETTING_NEW_POSTS_ALARM_NAME = "alarm-getting-new-posts";
const GETTING_NEW_POSTS_PERIOD_MINS = 30;

let IS_GETTING_NEW_POSTS = false;
// ================================================================================ //

// ================================= INTERFACES =================================== //
interface SeriesItem {
  _type: "seriesItem"; // internal interface identity
  title: string;
  link: string;
  newCount?: number;
}
// ================================================================================ //

async function getSessionFromCookie(): Promise<string | null> {
  if (chrome.cookies) {
    const details: chrome.cookies.Details = {
      name: "NEO_SES",
      url: "https://www.webtoons.com",
    };
    const cookie = await chrome.cookies.get(details);
    return cookie?.value || null;
  }
  return null;
}

// ============================== SERIES LOAD / SAVE ============================== //
async function loadSeries(): Promise<SeriesItem[] | null> {
  if (chrome.storage) {
    return chrome.storage.sync.get(STORAGE_SERIES_NAME).then((items) => {
      if (STORAGE_SERIES_NAME in items) {
        const value = items[STORAGE_SERIES_NAME];
        if (
          Array.isArray(value) &&
          value.every((v) => "_type" in v && v._type === "seriesItem")
        ) {
          return value as SeriesItem[];
        }
      }
      return null;
    });
  }
  return null;
}

async function saveSeries(series: SeriesItem[]) {
  if (chrome.storage) {
    return chrome.storage.sync.set({
      [STORAGE_SERIES_NAME]: series,
    });
  }
}
// ================================================================================ //

async function getCounter() {
  return chrome.storage.sync.get(STORAGE_COUNTER_NAME).then((items) => {
    if (STORAGE_COUNTER_NAME in items) {
      return items[STORAGE_COUNTER_NAME];
    }
    return null;
  });
}

async function setCounter(newValue: number) {
  return chrome.storage.sync.set({ [STORAGE_COUNTER_NAME]: newValue });
}

async function addCounter(value: number) {
  return chrome.storage.sync
    .get(STORAGE_COUNTER_NAME)
    .then((items) => {
      if (STORAGE_COUNTER_NAME in items) {
        const oldValue = items[STORAGE_COUNTER_NAME];
        if (typeof oldValue === "number") {
          return oldValue + value;
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

async function getWebtoonsFromMyPost(): Promise<boolean | null> {
  // Returns:
  //     - `true` : webtoons are parsed & saved
  //     - `false`: webtoons are parsed & not saved
  //     - `null` : webtoons are not parsed

  const url = "https://www.webtoons.com/en/mypost";
  const session = await getSessionFromCookie();
  if (!session) {
    console.error("Unable to get session from cookie");
    return null;
  }
  const headers = new Headers([["Cookie", session]]);
  const options: RequestInit = {
    credentials: "include",
    headers,
  };
  const resp = await fetch(url, options);

  if (!resp.ok) {
    console.error("Failed to fetch `mypost`");
    return null;
  }

  const html = await resp.text();

  // Using Regex since no DOM in service worker
  const webtoons: SeriesItem[] = [];

  const reItem = /<li class="item">(?<series>.+?)(?=<\/li>)/gs;
  const reLink = /<a.+href=\"(.+?)(?=\")/i;
  const reTitle = /<p.+class="subj">(.+?)(?=<\/p>)/i;

  const matchIter = html.matchAll(reItem);
  let match = matchIter.next();
  if (match === undefined) {
    // there should be a match??
    console.error("Unable to match series items");
    return null;
  }
  while (match.done !== true) {
    const groups = match.value.groups;
    if (groups && "series" in groups) {
      const item = groups.series;
      const linkMatch = item.match(reLink);
      const titleMatch = item.match(reTitle);
      if (
        linkMatch &&
        titleMatch &&
        linkMatch.length >= 2 &&
        titleMatch.length >= 2
      ) {
        const title = titleMatch[1];
        const link = linkMatch[1];
        webtoons.push({ _type: "seriesItem", title, link });
      } else {
        // Something went wrong?
        console.error("Unable to parse webtoon information from:\n\n", item);
        return null;
      }
    }
    match = matchIter.next();
  }

  // Check storage and store if different
  const stored = await loadSeries();
  let isDifferent = stored === null || stored.length !== webtoons.length;
  let series: SeriesItem[] = [];
  if (stored === null) {
    series = webtoons;
  } else {
    series = webtoons.map((wt) => {
      const exSeries = stored.find((v) => v.title === wt.title);
      if (exSeries) {
        if (wt.link !== exSeries.link) {
          // Unexpected.. Webtoons is changing links??
          isDifferent = true;
          // Object assign to keep the newCount data
          return Object.assign({}, exSeries, wt);
        } else {
          return exSeries;
        }
      } else {
        // New Webtoon series
        isDifferent = true;
        return wt;
      }
    });
  }

  if (isDifferent) {
    saveSeries(series);
    return true;
  }

  return false;
}

// ================================ EVENT LISTENERS =============================== //
const getWebtoonsCallback = (force: boolean = false) => {
  const callback = () => {
    console.log("Process Start: getWebtoonsFromMyPost");
    getWebtoonsFromMyPost().then((ret) => {
      console.log("Process Done: getWebtoonsFromMyPost");
      console.log(
        `Process Result: ${
          ret === null ? "Fail" : ret ? "Webtooons saved!" : "No new webtoons"
        }`
      );
      // Delay next callback (no spamming!)
      chrome.alarms.create(GETTING_SERIES_ALARM_NAME, {
        delayInMinutes: GETTING_SERIES_DELAY_MINS,
      });
    });
  };
  if (force) {
    callback();
  } else {
    chrome.alarms.get(GETTING_SERIES_ALARM_NAME).then((alarm) => {
      if (!alarm) {
        callback();
      }
    });
  }
};

chrome.windows.onCreated.addListener(() => {
  console.log("windows.onCreated");
  getWebtoonsCallback();
});

chrome.tabs.onActivated.addListener(() => {
  console.log("tabs.onActivated");
  getWebtoonsCallback();
});
chrome.tabs.onUpdated.addListener(() => {
  console.log("tabs.onUpdated");
  getWebtoonsCallback();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === GETTING_SERIES_ALARM_NAME) {
    chrome.alarms.clear(alarm.name);
  }
  if (alarm.name === GETTING_NEW_POSTS_ALARM_NAME) {
    // execute getting new posts
    // No spamming! (if the process is taking more than 30 mins)
    if (!IS_GETTING_NEW_POSTS) {
      // get new posts
      IS_GETTING_NEW_POSTS = true;
    } else {
      // the process took more than 30 mins
      // this should not happen..
      console.warn(
        "Getting new comments is taking long. Perhaps something went wrong?"
      );
    }
  }
});

chrome.runtime.onInstalled.addListener((installDetails) => {
  switch (installDetails.reason) {
    case "install":
    case "update":
      console.log(
        `Extension on${
          installDetails.reason.charAt(0).toUpperCase() +
          installDetails.reason.substring(1).toLowerCase()
        }`
      );
      // Force getWebtoonsCallback
      // in case of new changes and/or existing alarm in the way
      getWebtoonsCallback(true);

      // Create alarm for getting new posts
      // Overwrite existing alarm if there is one
      chrome.alarms.create(GETTING_NEW_POSTS_ALARM_NAME, {
        delayInMinutes: 1, // to give time for getting Webtoons
        periodInMinutes: GETTING_NEW_POSTS_PERIOD_MINS,
      });
      break;
  }
});
// ================================================================================ //
