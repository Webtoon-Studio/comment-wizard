import type { PostIdType } from "@shared/post";

function generateRandomString(): string {
	const dec2hex = (dec: number) => dec.toString(16).padStart(2, "0");
	var arr = new Uint8Array(4);
	crypto.getRandomValues(arr);
	return Array.from(arr, dec2hex).join('');
}

const STORAGE_SETTING_NAME = "cs-settings";
const STORAGE_TITLES_NAME = "cs-title-items";
const STORAGE_NEWEST_NAME = "cs-newest-posts";
const STROAGE_COUNT_NAME = "cs-post-counts";
const STORAGE_POSTS_NAME = "cs-all-posts";
const STORAGE_WEBTOONS_NAME = "cs-webtoons";

const POSTS_REQUEST_EVENT_NAME = "postsRequest";
const POSTS_FETCHED_EVENT_NAME = "postsFetched";

const INCOM_ONMOUNTED_EVENT_NAME = "incomMounted";
const INCOM_REQUEST_SERIES_ITEM_EVENT = "incomSeriesRequest";
const INCOM_RESPONSE_SERIES_ITEM_EVENT = "incomSeriesResponse";
const INCOM_REQUEST_POSTS_EVENT = "incomPostsRequest";
const INCOM_RESPONSE_POSTS_EVENT = "incomePostsResponse";
const INCOM_PATCH_POST_EVENT = "incomPostPatch";


const IS_DEV = (() => {
	try {
		return import.meta.env.DEV;
	} catch {
		return false;
	}
})();


export interface SeriesItem {
	_type: "seriesItem"; // internal interface identity
	title: string;
	link: string;
	titleId: `${number}`;
	isCanvas?: boolean;
	newCount?: number;
}

export interface EpisodeItem {
	_type: "episodeItem"; // internal interface identity
	seriesId: `${number}`;
	index: number;
	thumb: string;
	title: string;
	date: number;
}

export interface EpisodeNewestPost {
	_type: "episodeNewestPost";
	titleId: string;
	episode: number;
	newestPostId: PostIdType;
}

export function isPostIdNewer(
	value: PostIdType,
	compared: PostIdType,
): boolean {
	// Return:
	//     - 'true': `postId` is newer
	//     - 'false': `postId` is not newer
	const valueId = Number.parseInt(value.split("-")[3], 36);
	const comparedId = Number.parseInt(compared.split("-")[3], 36);
	return valueId > comparedId;
}

export async function getSessionFromCookie(): Promise<string | null> {
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

export async function getCurrentUserSession(): Promise<string | null> {
	try {
		var chromeCookie = await getSessionFromCookie();
		if (chromeCookie !== null) {
			return chromeCookie;
		} 

		var cookie = document.cookie;
		var cookies = cookie.split(";");

		for (var i = 0; i < cookies.length; i++) {
			var cookieItem = cookies[i].trim();
			if (cookieItem.startsWith("NEO_SES=")) {
				return cookieItem.substring("NEO_SES=".length, cookieItem.length);
			}
		}
	} catch {
		console.error("Unable to get current user session");
	}
	return null;
}

export async function getApiToken(): Promise<string | undefined> {
	const url = "https://www.webtoons.com/p/api/community/v1/api-token";

	const session = await getSessionFromCookie();

	if (session === null) {
		throw new Error("Failed to get current user session from cookie");
	}

	const headers = new Headers();
	headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
	headers.append("Cookie", session);

	const response = await fetch(url, { headers: headers });

	// NOTE: Example:
	// {
	// 	"status": "success",
	// 	"result": {
	// 		"token": "1:59391548-5153-79b1-b880-878c20cceba2:u"
	// 	}
	// }

	type ApiTokenResponse = {
		status: string;
		result?: {
			token: string;
		};
		error?: {
			code: string;
			typeMessage: string;
		};
	};

	const json = (await response.json()) as ApiTokenResponse;

	if (json.status !== "success" || !json.result) {
		throw new Error(`Fetch to /api-token failed: ${json.error?.typeMessage}`);
	}

	return json.result.token;
}

export {
	IS_DEV,
	STORAGE_SETTING_NAME,
	STORAGE_TITLES_NAME,
	STORAGE_NEWEST_NAME,
	STROAGE_COUNT_NAME,
	STORAGE_POSTS_NAME,
	STORAGE_WEBTOONS_NAME,
	POSTS_REQUEST_EVENT_NAME,
	POSTS_FETCHED_EVENT_NAME,
	INCOM_ONMOUNTED_EVENT_NAME,
	INCOM_REQUEST_SERIES_ITEM_EVENT,
	INCOM_RESPONSE_SERIES_ITEM_EVENT,
	INCOM_REQUEST_POSTS_EVENT,
	INCOM_RESPONSE_POSTS_EVENT,
	INCOM_PATCH_POST_EVENT
};
