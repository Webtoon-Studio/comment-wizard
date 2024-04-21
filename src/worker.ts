import {
  STORAGE_SERIES_NAME,
  STORAGE_NEWEST_NAME,
  STORAGE_POSTS_NAME,
} from "./global";
import { IPost, PageIdType, Post, PostIdType, Webtoon } from "./webtoon";

// =============================== GLOBAL VARIABLES =============================== //
const GETTING_SERIES_ALARM_NAME = "alarm-getting-series-delay";
const GETTING_SERIES_DELAY_MINS = 60;
const GETTING_NEW_POSTS_ALARM_NAME = "alarm-getting-new-posts";
const GETTING_NEW_POSTS_PERIOD_MINS = 30;

const POSTS_QUEUE: Post[] = [];
const FAILED_URL_DUMP: { timestamp: number; url: string }[] = [];

let IS_GETTING_NEW_POSTS = false;
let IS_STORING_POSTS = false;
// ================================================================================ //

// ================================= INTERFACES =================================== //
interface SeriesItem {
  _type: "seriesItem"; // internal interface identity
  title: string;
  link: string;
  titleId: `${number}`;
  isCanvas?: boolean;
  newCount?: number;
}

interface PostsQueryProp {
  pageId: PageIdType;
  prevSize?: number;
  nextSize?: number;
  cursor?: PostIdType;
}

interface EpisodeNewestPost {
  _type: "episodeNewestPost";
  titleId: string;
  episode: number;
  newestPostId: PostIdType;
}

type GetPostsRepsonse = {
  status: "success" | "fail" | "done";
  newestPost?: PostIdType;
};

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

function isPostIdNewer(value: PostIdType, compared: PostIdType): boolean {
  // Return:
  //     - 'true': `postId` is newer
  //     - 'false': `postId` is not newer
  const valueId = parseInt(value.split("-")[3], 36);
  const comparedId = parseInt(value.split("-")[3], 36);
  return valueId > comparedId;
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

async function appendPostsToStorage(posts: Post[]) {
  if (!IS_STORING_POSTS) {
    // Store posts & queue
    console.log("Storing Posts");
    IS_STORING_POSTS = true;

    // First get queue
    const queue: Post[] = POSTS_QUEUE.slice();

    chrome.storage.local.get(STORAGE_POSTS_NAME).then((items) => {
      const allPosts = [...posts, ...queue];
      if (STORAGE_POSTS_NAME in items) {
        const exPosts = items[STORAGE_POSTS_NAME] as Post[];
        allPosts.push(...exPosts);
      }
      const postsToStore: Post[] = [];

      // Remove duplicates
      allPosts.forEach((post) => {
        if (!postsToStore.find((p) => p.id === post.id)) {
          postsToStore.push(post);
        }
      });

      postsToStore.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      chrome.storage.local
        .set({
          [STORAGE_POSTS_NAME]: postsToStore,
        })
        .then(() => {
          console.log("Posts stored!");

          POSTS_QUEUE.splice(0, queue.length);
          IS_STORING_POSTS = false;
        });
    });
  } else {
    // currently storing, add to queue and try again
    console.log("Storage is busy. Queueing the posts");
    POSTS_QUEUE.push(...posts);
    setTimeout(() => appendPostsToStorage([]), 500);
  }
}

async function getNewestPostsFromStorage(): Promise<
  EpisodeNewestPost[] | null
> {
  return chrome.storage.local.get(STORAGE_NEWEST_NAME).then((items) => {
    if (STORAGE_NEWEST_NAME in items) {
      const value = items[STORAGE_NEWEST_NAME];
      if (
        Array.isArray(value) &&
        value.every((v) => "_type" in v && v._type === "episodeNewestPost")
      ) {
        return value as EpisodeNewestPost[];
      }
    }
    return null;
  });
}

async function updateNewestPostsToStorage(newest: EpisodeNewestPost[]) {
  chrome.storage.local.set({
    [STORAGE_NEWEST_NAME]: newest,
  });
}

// This is a wrapper for getSeriesFromMyPost
// Always use this since this will check & create alarm for reducing spamming
const getSeries = (force: boolean = false) => {
  // Refactor this out due to 'force' param
  const executeGetSeries = () => {
    console.log("Process Start: getSeriesFromMyPost");
    getSeriesFromMyPost().then((ret) => {
      console.log("Process Done: getSeriesFromMyPost");
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
    executeGetSeries();
  } else {
    chrome.alarms.get(GETTING_SERIES_ALARM_NAME).then((alarm) => {
      if (!alarm) {
        executeGetSeries();
      }
    });
  }
};

async function getSeriesFromMyPost(): Promise<boolean | null> {
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
  const reDetail =
    /.*webtoons\.com\/\w{2,4}\/(?<type>.+?)(?=\/).+title_no=(?<titleId>\d+)/i;

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
        linkMatch.length >= 2 &&
        titleMatch &&
        titleMatch.length >= 2
      ) {
        const title = titleMatch[1];
        const link = linkMatch[1];
        const detailMatch = link.match(reDetail);
        if (
          detailMatch &&
          detailMatch.groups &&
          "titleId" in detailMatch.groups &&
          "type" in detailMatch.groups
        ) {
          const titleId = detailMatch.groups.titleId as `${number}`;
          const isCanvas = detailMatch.groups.type.toLowerCase() === "canvas";
          webtoons.push({
            _type: "seriesItem",
            title,
            link,
            titleId,
            isCanvas,
          });
        } else {
          // Something went wrong?
          console.error("Unable to parse series details from:\n\n", link);
          return null;
        }
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
        if (
          wt.link !== exSeries.link ||
          wt.isCanvas !== exSeries.isCanvas ||
          wt.titleId !== exSeries.titleId
        ) {
          // Unexpected changes
          // Unless there's been a structure change
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

function generatePostsQueryUrl(queryProp: PostsQueryProp) {
  const { pageId, prevSize = 0, nextSize = 100, cursor = "" } = queryProp;
  const baseUrl = "https://www.webtoons.com/p/api/community/v2";
  const query: { [keyof: string]: any } = {
    pageId,
    pinRepresentation: "none",
    prevSize,
    nextSize,
    cursor,
    withCursor: true,
  };
  const queryPath = Object.keys(query)
    .map((key) => `${key}=${query[key]}`)
    .join("&");

  `pinRepresentation=none&prevSize=0&nextSize=100`;
  return `${baseUrl}/posts?${queryPath}`;
}

async function getPosts(
  pageId: PageIdType,
  prevNewestPost?: PostIdType,
  cursor?: PostIdType
): Promise<GetPostsRepsonse> {
  // Return:
  //     - 'true': Got posts and saved
  //     - 'false': Reached 404, which may mean this is the end of episodes
  //     - 'null': Something went wrong and could not get posts
  let newNewestPost: PostIdType | undefined;

  const controller = new AbortController();
  const url = generatePostsQueryUrl({ pageId, cursor });
  const session = await getSessionFromCookie();

  if (!session) {
    console.error("Could not get session info. Perhaps not logged in?");
    return {
      status: "fail",
    };
  }

  const headers = new Headers([
    ["Service-Ticket-Id", "epicom"],
    ["Accept-Encoding", "gzip, deflate, br, zstd"],
    ["Cookie", session],
    // ["Api-Token", apiToken]
  ]);

  // Wait 1800 ms before aborting the request
  const timeoutId = setTimeout(() => controller.abort(), 1800);
  const response = await fetch(url, {
    headers,
    signal: controller.signal, // To abort if takes too long
  }).catch((err) => {
    if (err.name === "AbortError") {
      console.error("Aborted: Perhaps too many request?");
      FAILED_URL_DUMP.push({ timestamp: new Date().getTime(), url });
      return new Response(null, { status: 408 });
    }
    console.error("Error during fetch:", err);
    return null;
  });
  clearTimeout(timeoutId);

  if (!response) {
    return {
      status: "fail",
    };
  }

  // NOTE: If an episode doesnt exist, then it will return a 404.
  // This signifies that all available episodes have been gone through.
  if (response.status === 404) {
    return {
      status: "done",
    };
  }

  try {
    const json = await response.json();
    if (json.status === "fail") {
      console.log(json);
      console.error("Failed to get posts from api: " + json.error);
      return {
        status: "fail",
      };
    }

    const resultPosts = json.result.posts as IPost[];
    const posts = resultPosts.map((p) => new Post(p));

    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    posts.forEach((p) => {
      if (!newNewestPost && p.id) {
        if (prevNewestPost) {
          if (isPostIdNewer(p.id, prevNewestPost)) {
            newNewestPost = p.id;
          }
        } else {
          newNewestPost = p.id;
        }
      }
    });

    appendPostsToStorage(posts);

    const next = json.result.pagination.next as PostIdType;
    if (next) {
      return getPosts(pageId, newNewestPost ? undefined : prevNewestPost, next);
    }
    return {
      status: "success",
      newestPost: newNewestPost,
    };
  } catch (err) {
    console.error("Something went wrong post fetch: ", err);
    return {
      status: "fail",
      newestPost: newNewestPost,
    };
  }
}

async function getNewPosts(): Promise<boolean> {
  // Return:
  //     - 'true': new posts successfully fetched
  //     - 'false': new posts not fetched (try again?)
  const seriesList = await loadSeries();
  if (!seriesList) {
    getSeries(true);
    return false;
  }

  const newest = await getNewestPostsFromStorage();
  const newNewest: EpisodeNewestPost[] = [];

  // get Posts
  for (let i = 0; i < seriesList.length; i++) {
    const series = seriesList[i];
    let result;
    let episodeNum = 1;

    const newestMap: Map<number, PostIdType> = new Map<number, PostIdType>();
    if (newest) {
      newest.forEach((item) => {
        if (item.titleId === series.titleId) {
          newestMap.set(item.episode, item.newestPostId);
        }
      });
    }

    while (result?.status !== "done") {
      const pageId: PageIdType = `${series.isCanvas ? "c" : "w"}_${
        series.titleId
      }_${episodeNum}`;
      result = await getPosts(pageId, newestMap.get(episodeNum));
      if (result.newestPost) {
        newestMap.set(episodeNum, result.newestPost);
      }
      episodeNum += 1;
    }

    newNewest.push(
      ...Array.from(newestMap).map(
        (v) =>
          ({
            _type: "episodeNewestPost",
            titleId: series.titleId,
            episode: v[0],
            newestPostId: v[1],
          } as EpisodeNewestPost)
      )
    );
  }

  await updateNewestPostsToStorage(newNewest);

  if (FAILED_URL_DUMP.length > 0) {
    console.log(
      "Following fetch failed:\n\n",
      FAILED_URL_DUMP.map((v, i) => `\t${i}:\t${v.url} (${v.timestamp})`).join(
        "\n"
      )
    );
  }

  return true;
}

// ================================ EVENT LISTENERS =============================== //
chrome.windows.onCreated.addListener(() => {
  console.log("windows.onCreated");
  getSeries();
});

chrome.tabs.onActivated.addListener(() => {
  console.log("tabs.onActivated");
  getSeries();
});
chrome.tabs.onUpdated.addListener(() => {
  console.log("tabs.onUpdated");
  getSeries();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === GETTING_SERIES_ALARM_NAME) {
    chrome.alarms.clear(alarm.name);
  }
  if (alarm.name === GETTING_NEW_POSTS_ALARM_NAME) {
    // execute getting new posts
    // No spamming! (if the process is taking more than 30 mins)
    if (!IS_GETTING_NEW_POSTS) {
      console.log("Process Start: getNewPosts");
      // get new posts
      IS_GETTING_NEW_POSTS = true;
      let startTime = new Date().getTime();
      getNewPosts().then((ret) => {
        IS_GETTING_NEW_POSTS = false;
        console.log(
          `Process End: getNewPosts (${new Date().getTime() - startTime} ms)`
        );
        console.log(`Process Result: ${ret}`);
        if (!ret) {
          // getting new posts failed
          // try again later?
          chrome.alarms.create(GETTING_NEW_POSTS_ALARM_NAME, {
            delayInMinutes: 1,
            periodInMinutes: GETTING_NEW_POSTS_PERIOD_MINS,
          });
        }
      });
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
      // Force getSeries in case of new changes and/or existing alarm in the way
      getSeries(true);

      // Create alarm for getting new posts
      // Overwrite existing alarm if there is one
      chrome.alarms.create(GETTING_NEW_POSTS_ALARM_NAME, {
        delayInMinutes: 0, // <- test 1, // to give time for getting Webtoons
        periodInMinutes: GETTING_NEW_POSTS_PERIOD_MINS,
      });
      break;
  }
});
// ================================================================================ //
