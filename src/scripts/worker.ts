import { Webtoon } from "@shared/webtoon";
import {
	POSTS_REQUEST_EVENT_NAME,
	STORAGE_NEWEST_NAME,
	STORAGE_POSTS_NAME,
	STORAGE_SERIES_NAME,
	getSessionFromCookie,
	STORAGE_WEBTOONS_NAME,
	INCOM_REQUEST_SERIES_ITEM_EVENT,
	type SeriesItem,
	type EpisodeNewestPost,
} from "@shared/global";

// =============================== GLOBAL VARIABLES =============================== //
const GETTING_SERIES_ALARM_NAME = "alarm-getting-series-delay";
const GETTING_SERIES_DELAY_MINS = 60;
const GETTING_NEW_POSTS_ALARM_NAME = "alarm-getting-new-posts";
const GETTING_NEW_POSTS_PERIOD_MINS = 30;

let IS_GETTING_NEW_POSTS = false;
let IS_STORING_POSTS = false;
// ================================================================================ //

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

async function loadWebtoons(): Promise<Webtoon[]> {
	if (chrome.storage) {
		return chrome.storage.local.get(STORAGE_WEBTOONS_NAME).then((items) => {
			if (STORAGE_WEBTOONS_NAME in items) {
				const value = items[STORAGE_WEBTOONS_NAME];
				if (Array.isArray(value) && value.every((v) => "url" in v)) {
					return value.map((v) => new Webtoon(v.url, v.errorQueue, v.postsArray));
				}
			}
			return [];
		});
	}
	return [];
}

async function saveWebtoons(webtoons: Webtoon[]) {
	if (chrome.storage) {
		await chrome.storage.local.set({
			[STORAGE_WEBTOONS_NAME]: webtoons.map((wt) => ({
				url: wt.url,
				errorQueue: wt.lastError,
				postsArray: wt.postsArray
			}))
		});
	}
}

async function getWebtoonById(titleId: `${number}`): Promise<Webtoon | null> {
	return loadWebtoons().then((wts) => {
		return wts?.find(wt => wt.titleId === titleId) || null;
	});
}

async function pushWebtoon(webtoon: Webtoon) {
	await loadWebtoons().then((wts) => {
		return [...wts.filter(wt => wt.titleId !== webtoon.titleId), webtoon];
	}).then((wts) => {
		saveWebtoons(wts);
	});
}

// async function appendPostsToStorage(posts: Post[]) {
// 	if (!IS_STORING_POSTS) {
// 		// Store posts & queue
// 		console.log("Storing Posts");
// 		IS_STORING_POSTS = true;

// 		// First get queue
// 		const queue: Post[] = POSTS_QUEUE.slice();

// 		chrome.storage.local.get(STORAGE_POSTS_NAME).then((items) => {
// 			const allPosts = [...posts, ...queue];
// 			if (STORAGE_POSTS_NAME in items) {
// 				const exPosts = items[STORAGE_POSTS_NAME] as Post[];
// 				allPosts.push(...exPosts);
// 			}
// 			const postsToStore: Post[] = [];

// 			// Remove duplicates
// 			allPosts.forEach((post) => {
// 				if (!postsToStore.find((p) => p.id === post.id)) {
// 					postsToStore.push(post);
// 				}
// 			});

// 			postsToStore.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
// 			chrome.storage.local
// 				.set({
// 					[STORAGE_POSTS_NAME]: postsToStore,
// 				})
// 				.then(() => {
// 					console.log("Posts stored!");

// 					POSTS_QUEUE.splice(0, queue.length);
// 					IS_STORING_POSTS = false;
// 				});
// 		});
// 	} else {
// 		// currently storing, add to queue and try again
// 		console.log("Storage is busy. Queueing the posts");
// 		POSTS_QUEUE.push(...posts);
// 		setTimeout(() => appendPostsToStorage([]), 500);
// 	}
// }

// async function getNewestPostsFromStorage(): Promise<
// 	EpisodeNewestPost[] | null
// > {
// 	return chrome.storage.local.get(STORAGE_NEWEST_NAME).then((items) => {
// 		if (STORAGE_NEWEST_NAME in items) {
// 			const value = items[STORAGE_NEWEST_NAME];
// 			if (
// 				Array.isArray(value) &&
// 				value.every((v) => "_type" in v && v._type === "episodeNewestPost")
// 			) {
// 				return value as EpisodeNewestPost[];
// 			}
// 		}
// 		return null;
// 	});
// }

// async function updateNewestPostsToStorage(newest: EpisodeNewestPost[]) {
// 	chrome.storage.local.set({
// 		[STORAGE_NEWEST_NAME]: newest,
// 	});
// }

// This is a wrapper for getSeriesFromMyPost
// Always use this since this will check & create alarm for reducing spamming
function getSeries(force = false) {
	// Refactor this out due to 'force' param
	const executeGetSeries = () => {
		console.log("Process Start: getSeriesFromMyPost");
		getSeriesFromMyPost().then((ret) => {
			console.log("Process Done: getSeriesFromMyPost");
			console.log(
				`Process Result: ${
					ret === null ? "Fail" : ret ? "Webtooons saved!" : "No new webtoons"
				}`,
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

	const reItem = /<li[^<>]*class="item"[^<>]*>(?<series>.+?)(?=<\/li>)/gs;
	const reLink = /<a[^<>]*href=\"(.+?)(?=\")/i;
	const reTitle = /<p[^<>]*class="subj"[^<>]*>(.+?)(?=<\/p>)/i;
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

async function getNewPosts(): Promise<boolean> {
	const seriesList = await loadSeries();

	if (!seriesList || seriesList.length === 0) {
		getSeries(true);
		return false;
	}

	let result: boolean = true;
	let webtoonsList = await loadWebtoons();

	for (let series of seriesList) {
		const exId = webtoonsList.findIndex((wt) => wt.titleId === series.titleId);
		const wt = exId === -1 ? new Webtoon(series.link) : webtoonsList[exId];

		await wt.getAllPosts();

		if (exId > -1) {
			webtoonsList[exId] = wt;
		} else {
			webtoonsList.push(wt);
		}

		if (result && wt.status === 'error') {
			result = false;
		}
	}

	await saveWebtoons(webtoonsList);

	return result;
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
			const startTime = new Date().getTime();
			getNewPosts().then((ret) => {
				IS_GETTING_NEW_POSTS = false;
				console.log(
					`Process End: getNewPosts (${new Date().getTime() - startTime} ms)`,
				);
				console.log(`Process Result: ${ret}`);
				if (!ret) {
					// getting new posts failed
					// try again later?
					chrome.alarms.create(GETTING_NEW_POSTS_ALARM_NAME, {
						delayInMinutes: 5,
						periodInMinutes: GETTING_NEW_POSTS_PERIOD_MINS,
					});
				}
			});
		} else {
			// the process took more than 30 mins
			// this should not happen..
			console.warn(
				"Getting new comments is taking long. Perhaps something went wrong?",
			);
		}
	}
});

chrome.runtime.onMessage.addListener(
	(
		message: any,
		sender: chrome.runtime.MessageSender,
		sendReponse: (resopnse?: any) => void,
	) => {
		if (message.greeting === POSTS_REQUEST_EVENT_NAME) {
			// Incoming Comments Component is mounted and is requesting data
			// Start fetching, but for now send the stored data (if exist)
			// Once fetch is done, the data should be synced via storage.local.onChange event

			// Fetching new posts is handled via alarm event
			chrome.alarms.create(GETTING_NEW_POSTS_ALARM_NAME, {
				delayInMinutes: 0,
				periodInMinutes: GETTING_NEW_POSTS_PERIOD_MINS,
			});

			// Sending what's in the storage
			loadWebtoons().then((wts) => {
				sendReponse({
					webtoons: wts
				})
			});
			return true;
		}
		if (message.greeting === INCOM_REQUEST_SERIES_ITEM_EVENT) {
			console.log("runtime: Incom requests series items");
			getSeriesFromMyPost().then(result => {
				if (result !== null) {
					loadSeries().then((loaded) => {
						console.log("runtime: Send response to Series Items Request");
						sendReponse({
							series: loaded
						});
					});
				} else {
					sendReponse({
						series: null
					});
				}
			});
			return true;
		}
		return false;
	},
);

chrome.runtime.onInstalled.addListener((installDetails) => {
	switch (installDetails.reason) {
		case "install":
		case "update":
			console.log(
				`Extension on${
					installDetails.reason.charAt(0).toUpperCase() +
					installDetails.reason.substring(1).toLowerCase()
				}`,
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
