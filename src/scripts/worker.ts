import { Webtoon, type StoredWebtoonData, type TitleIdType } from "@shared/webtoon";
import {
	POSTS_REQUEST_EVENT_NAME,
	STORAGE_NEWEST_NAME,
	STORAGE_POSTS_NAME,
	STORAGE_TITLES_NAME,
	getSessionFromCookie,
	STORAGE_WEBTOONS_NAME,
	INCOM_REQUEST_SERIES_ITEM_EVENT,
	type EpisodeNewestPost,
	INCOM_REQUEST_POSTS_EVENT,
	STROAGE_COUNT_NAME,
} from "@shared/global";
import type { Post, PostCountType } from "@shared/post";
import { fetchProfileUrlFromUserInfo, parseAuthorIdFromProfilePage } from "@shared/author";
import { fetchWebtoonTitles, Title } from "@shared/title";

// =============================== GLOBAL VARIABLES =============================== //
const GETTING_SERIES_ALARM_NAME = "alarm-getting-series-delay";
const GETTING_SERIES_DELAY_MINS = 60;
const GETTING_NEW_POSTS_ALARM_NAME = "alarm-getting-new-posts";
const GETTING_NEW_POSTS_PERIOD_MINS = 30;

let IS_GETTING_NEW_POSTS = false;
let IS_STORING_POSTS = false;
// ================================================================================ //

// ============================== TITLES LOAD / SAVE ============================== //
async function loadTitles(): Promise<Title[] | null> {
	if (chrome.storage) {
		return chrome.storage.sync.get(STORAGE_TITLES_NAME).then((items) => {
			if (STORAGE_TITLES_NAME in items) {
				const value = items[STORAGE_TITLES_NAME];
				if (
					Array.isArray(value) &&
					value.every((v) => Title.isTitle(v))
				) {
					return value.map(v => new Title(v));
				}
			}
			return null;
		});
	}
	return null;
}

async function saveTitles(titles: Title[]) {
	if (chrome.storage) {
		return chrome.storage.sync.set({
			[STORAGE_TITLES_NAME]: titles,
		});
	}
}

async function cleanTitles(): Promise<boolean> {
	if (chrome.storage) {
		chrome.storage.sync.get(STORAGE_TITLES_NAME).then((items) => {
			if (STORAGE_TITLES_NAME in items) {
				const value = items[STORAGE_TITLES_NAME];
				if (Array.isArray(value)) {
					if (value.every(v => Title.isTitle(v))) {
						return false;
					}
					const cleaned = value.filter(v => Title.isTitle(v));
					if (cleaned.length > 0) {
						chrome.storage.sync.set({
							[STORAGE_TITLES_NAME]: cleaned
						});
						return true;
					}
				}
				chrome.storage.sync.remove(STORAGE_TITLES_NAME);
				return true;
			}
		});
	}
	return false;
}
// ================================================================================ //

// ============================ POSTCOUNTS LOAD / SAVE ============================ //
async function loadPostCounts(): Promise<PostCountType[] | null> {
	if (chrome.storage) {
		return chrome.storage.sync.get(STROAGE_COUNT_NAME).then((items) => {
			if (STROAGE_COUNT_NAME in items) {
				const value = items[STROAGE_COUNT_NAME];
				if (
					Array.isArray(value) // Need a better validation
				) {
					return value as PostCountType[];
				}
			}
			return null;
		});
	}
	return null;
}

async function savePostCounts(postCounts: PostCountType[]) {
	if (chrome.storage) {
		return chrome.storage.sync.set({
			[STROAGE_COUNT_NAME]: postCounts,
		});
	}
}
// ================================================================================ //

// ================================================================================ //
async function loadWebtoons(titleId?: TitleIdType): Promise<StoredWebtoonData[]> {
	if (chrome.storage) {
		return chrome.storage.local.get(STORAGE_WEBTOONS_NAME).then((items) => {
			if (STORAGE_WEBTOONS_NAME in items) {
				const value = items[STORAGE_WEBTOONS_NAME];
				if (
					Array.isArray(value) && 
					value.every((v) => 
						"titleId" in v && 
						"posts" in v &&
						Array.isArray(v.posts)
					)
				) {
					if (titleId === undefined) {
						return value as StoredWebtoonData[];
					}
					return value.filter(
						v => v.titleId === titleId
					) as StoredWebtoonData[];
				}
			}
			return [];
		});
	}
	return [];
}

async function saveWebtoons(data: StoredWebtoonData[]) {
	if (chrome.storage) {
		await chrome.storage.local.set({
			[STORAGE_WEBTOONS_NAME]: data
		});
	}
}
// ================================================================================ //

// This is a wrapper for getSeriesFromMyPost
// Always use this since this will check & create alarm for reducing spamming
function getSeries(force = false) {
	// Refactor this out due to 'force' param
	const executeGetSeries = () => {
		console.log("Process Start: getSeriesFromMyPost");
		scrapeTitlesFromProfile().then((ret) => {
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

async function scrapeTitlesFromProfile(): Promise<boolean | null> {
	// Returns:
	//     - `true` : webtoons are parsed & saved
	//     - `false`: webtoons are parsed & not saved
	//     - `null` : webtoons are not parsed
	const session = await getSessionFromCookie();
	if (!session) {
		console.error("Unable to get session from cookie");
		return null;
	}
	const profileUrl = await fetchProfileUrlFromUserInfo(session);

	if (profileUrl === null) {
		console.error("Failed to get profile page URL");
		return null;
	}
	const cid = await parseAuthorIdFromProfilePage(profileUrl, session);

	if (cid === null) {
		console.error("Failed to get Author ID");
		return null;
	}

	const fetchedTitles = await fetchWebtoonTitles(cid, session);
	if (fetchedTitles === null) {
		console.error("Failed to fetch titles");
		return null;
	}

	// Check storage and store if different
	const stored = await loadTitles();
	let isDifferent = stored === null || stored.length !== fetchedTitles.length;
	let titles: Title[] = [];
	if (stored === null) {
		titles = fetchedTitles;
	} else {
		titles = fetchedTitles.map((t) => {
			const exTitle = stored.find((v) => v.id === t.id);
			if (exTitle) {
				if (t !== exTitle) {
					// Unexpected changes
					// Unless there's been a structure change
					isDifferent = true;
					// Object assign to keep the newCount data
					return new Title(Object.assign({}, exTitle, t));
				} else {
					return exTitle;
				}
			} else {
				// New Webtoon series
				isDifferent = true;
				return t;
			}
		});
	}

	if (isDifferent) {
		saveTitles(titles);
		return true;
	}

	return false;
}

async function getNewPosts(): Promise<boolean> {
	const titleList = await loadTitles();

	if (!titleList || titleList.length === 0) {
		getSeries(true);
		return false;
	}

	let result: boolean = true;
	const stored = await loadWebtoons();
	const saveData: StoredWebtoonData[] = [];

	for (let title of titleList) {
		const wt = new Webtoon(title);

		const found = stored.find(d => d.titleId === title.id);
		if (found) {
			wt.assignPosts(found.posts);
		}

		await wt.getAllPosts();

		for (var posts of wt.posts.values()) {
			for (var post of posts) {
				await post.getReplies();
			}
		}

		if (result && wt.status === 'error') {
			result = false;
		}

		saveData.push(wt.getSaveData())
	}

	await saveWebtoons(saveData);
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
			scrapeTitlesFromProfile().then(result => {
				if (result !== null) {
					loadTitles().then((loaded) => {
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
		if (message.greeting === INCOM_REQUEST_POSTS_EVENT) {
			console.log("runtime: Incom requests posts");
			const titleId: `${number}` | undefined = message.titleId;
			const episodeNo: number | undefined = message.episodeNo;

			chrome.alarms.create(GETTING_NEW_POSTS_ALARM_NAME, {
				delayInMinutes: 0,
				periodInMinutes: GETTING_NEW_POSTS_PERIOD_MINS,
			});

			// Sending what's in the storage
			loadWebtoons(titleId).then((data) => {
				const posts = data.map(d => d.posts).reduce((p, v) => [...p.concat(v)], []);
				sendReponse({ posts });
			});
			
			return true;
		}
		return false;
	},
);

chrome.runtime.onInstalled.addListener(async (installDetails) => {
	switch (installDetails.reason) {
		case "install":
		case "update":
			console.log(
				`Extension on${
					installDetails.reason.charAt(0).toUpperCase() +
					installDetails.reason.substring(1).toLowerCase()
				}`,
			);
			await cleanTitles();
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
