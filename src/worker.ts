// import Webtoon from "./webtoon.js";

const INTERVAL_DELAY_MS = 1000 * 60 * 30; // 30 minutes

const STORAGE_COUNTER_NAME = "cs_new_counter";

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
