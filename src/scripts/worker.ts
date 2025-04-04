import { Webtoon, type StoredWebtoonData, type TitleIdType } from "@shared/webtoon";
import {
	POSTS_REQUEST_EVENT_NAME,
	STORAGE_TITLES_NAME,
	getSessionFromCookie,
	STORAGE_WEBTOONS_NAME,
	INCOM_REQUEST_SERIES_ITEM_EVENT,
	INCOM_REQUEST_POSTS_EVENT,
	STROAGE_COUNT_NAME,
	INCOM_REQUEST_COUNTS_EVENT,
	INCOM_PATCH_POST_EVENT,
	INCOM_PATCH_MULTI_POSTS_EVENT,
} from "@shared/global";
import { countPosts, Post, type IPost, type PostCountType } from "@shared/post";
import { fetchProfileUrlFromUserInfo, parseAuthorIdFromProfilePage } from "@shared/author";
import { fetchWebtoonTitles, Title } from "@shared/title";
import { cleanTitles, loadPostCounts, loadTitles, loadWebtoons, patchWebtoon, savePostCounts, saveTitles, saveWebtoons } from "@shared/storage";

// =============================== GLOBAL VARIABLES =============================== //
const GETTING_SERIES_ALARM_NAME = "alarm-getting-series-delay";
const GETTING_SERIES_DELAY_MINS = 60;
const GETTING_NEW_POSTS_ALARM_NAME = "alarm-getting-new-posts";
const GETTING_NEW_POSTS_PERIOD_MINS = 30;

let IS_GETTING_NEW_POSTS = false;
// let IS_STORING_POSTS = false;
// ================================================================================ //

async function updatePopupBadge() {
	// Update the popup badge with the number of new posts
	if (!chrome.action) {
		return;
	}
	const postCounts = await loadPostCounts();
	if (postCounts) {
		const isCompleted = postCounts.every((p) => p.isCompleted);
		if (isCompleted) {
			const totalNewCount = postCounts.reduce((p, v) => p + v.totalNewCount, 0);
			if (totalNewCount > 0) {
				chrome.action.setBadgeText({ text: totalNewCount.toString() });
			} else {
				chrome.action.setBadgeText({ text: "" });
			}
		} else {
			chrome.action.setBadgeText({ text: ".." });
		}	
	} else {
		chrome.action.setBadgeText({ text: ".." });
	}
}

// This is a wrapper for getSeriesFromMyPost
// Always use this since this will check & create alarm for reducing spamming
function getTitles(force = false) {
	// Refactor this out due to 'force' param
	const executeScrapeTitles = () => {
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
		executeScrapeTitles();
	} else {
		chrome.alarms.get(GETTING_SERIES_ALARM_NAME).then((alarm) => {
			if (!alarm) {
				executeScrapeTitles();
			}
		});
	}
}

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
		getTitles(true);
		return false;
	}

	let result: boolean = true;
	const wts: Webtoon[] = [];

	for (const title of titleList) {
		const wt = new Webtoon(title);

		await wt.getAllPosts();

		for (const posts of wt.posts.values()) {
			for (const post of posts) {
				await post.getReplies();
			}
		}

		if (result && wt.status === 'error') {
			result = false;
		}

		wts.push(wt);

	}

	// Load previous posts data after all posts are fetched 
	// to avoid overwriting posts updated during fetching
	const saveData: StoredWebtoonData[] = [];
	const postCounts: PostCountType[] = [];
	const stored = await loadWebtoons();

	for (const wt of wts) {
		const found = stored.find(d => d.titleId === wt.titleId);
		if (found) {
			wt.loadSavedPosts(found.posts.map(p => new Post(p)));
		}
	
		saveData.push(wt.getSaveData());
		postCounts.push(wt.getPostCounts());
	}

	await saveWebtoons(saveData);
	await savePostCounts(postCounts);

	return result;
}

async function patchPosts(patch: IPost[]) {
	if (patch.length === 0) return false;

	const grouped: Map<TitleIdType, IPost[]> = patch.reduce((p, c) => {
		const ps = p.get(c.titleId) ?? [];
		p.set(c.titleId, [...ps, c]);
		return p;
	}, new Map<TitleIdType, IPost[]>());

	const webtoons = await loadWebtoons();

	for (const [titleId, patchPosts] of grouped.entries()) {
		console.log("patching posts", titleId, patchPosts);
		const wt = webtoons.find(w => w.titleId === titleId)
		if (wt === undefined) continue;

		wt.posts = [
			...wt.posts.filter(p => !patchPosts.find(pp => pp.id === p.id)),
			...patchPosts
		];
	}

	await saveWebtoons(webtoons);
	await savePostCounts(webtoons.map(wt => countPosts(wt.posts)));

	return true;
}

// ================================ EVENT LISTENERS =============================== //
chrome.windows.onCreated.addListener(() => {
	console.log("windows.onCreated");
	getTitles();
});

chrome.tabs.onActivated.addListener(() => {
	console.log("tabs.onActivated");
	getTitles();
});
chrome.tabs.onUpdated.addListener(() => {
	console.log("tabs.onUpdated");
	getTitles();
});

chrome.storage.sync.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange}) => {
	console.log("storage.sync.onChanged", changes);
	if (STROAGE_COUNT_NAME in changes) {
		updatePopupBadge();
	}
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
		message: { greeting: string; titleId?: TitleIdType; episodeNo?: number; post?: IPost; changes?: Partial<IPost> },
		sender: chrome.runtime.MessageSender,
		sendReponse: (resopnse?: unknown) => void,
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

			// Return `true` to indicate that the message is being handled asynchronously
			return true;
		}
		if (message.greeting === INCOM_REQUEST_SERIES_ITEM_EVENT) {
			console.log("runtime: Incom requests series items");
			scrapeTitlesFromProfile().then(result => {
				if (result !== null) {
					loadTitles().then((loaded) => {
						console.log("runtime: Send response to Series Items Request");
						sendReponse({
							titles: loaded
						});
					});
				} else {
					sendReponse({
						titles: null
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
		if (message.greeting === INCOM_PATCH_POST_EVENT) {
			console.log("runtime: Incom patches post");
			const post: IPost | undefined = message.post;

			if (post === undefined) return false;

			patchPosts([post]);

			return false;
		}
		if (message.greeting === INCOM_PATCH_MULTI_POSTS_EVENT) {
			console.log("runtime: Incom patches multiple posts");
			const changes = message.changes;
			const titleId: TitleIdType | undefined = message.titleId;
			const episodeNo: number | undefined = message.episodeNo;

			if (changes === undefined || titleId === undefined) return false;

			loadWebtoons().then((wts) => {
				const wt = wts.find(w => w.titleId === titleId);
				if (wt) {
					const posts = episodeNo === undefined ? wt.posts : wt.posts.filter(p => p.episode === episodeNo);
					posts.forEach(p => {
						const cp = Object.assign(p, changes) as IPost;
						cp.replies.forEach(r => {
							r = Object.assign(r, changes) as IPost;
						});
						p = cp;
					});
					patchPosts(posts);
				}
			});

			return false;
		}
		if (message.greeting === INCOM_REQUEST_COUNTS_EVENT) {
			console.log("runtime: Incom requests counts");

			// Sending what's in the storage
			loadPostCounts().then((counts) => {
				sendReponse({ counts });
			});
			
			return true;
		}
		return false;
	},
);

chrome.runtime.onInstalled.addListener(async (installDetails) => {
	switch (installDetails.reason) {
		case "install":
		case "update": {
			console.log(
				`Extension on${
					installDetails.reason.charAt(0).toUpperCase() +
					installDetails.reason.substring(1).toLowerCase()
				}`,
			);
			await cleanTitles();
			// Force getSeries in case of new changes and/or existing alarm in the way
			getTitles(true);

			const stored = await loadWebtoons();
			// Create alarm for getting new posts
			// Overwrite existing alarm if there is one
			chrome.alarms.create(GETTING_NEW_POSTS_ALARM_NAME, {
				delayInMinutes: stored.length === 0 ? 0 : GETTING_NEW_POSTS_PERIOD_MINS, // <- test 1, // to give time for getting Webtoons
				periodInMinutes: GETTING_NEW_POSTS_PERIOD_MINS,
			});

			await updatePopupBadge();
			break;
		}
	}
});
// ================================================================================ //
