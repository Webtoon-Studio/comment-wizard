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
