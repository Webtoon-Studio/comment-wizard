import type { PostIdType } from "@root/src/post";

const STORAGE_SETTING_NAME = "cs-settings";
const STORAGE_SERIES_NAME = "cs-series-items";
const STORAGE_NEWEST_NAME = "cs-newest-posts";
const STORAGE_POSTS_NAME = "cs-all-posts";

const INCOM_ONMOUNTED_EVENT_NAME = "incomMounted";
const POSTS_REQUEST_EVENT_NAME = "postsRequest";
const POSTS_FETCHED_EVENT_NAME = "postsFetched";

export interface SeriesItem {
	_type: "seriesItem"; // internal interface identity
	title: string;
	link: string;
	titleId: `${number}`;
	isCanvas?: boolean;
	newCount?: number;
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
	STORAGE_SETTING_NAME,
	STORAGE_SERIES_NAME,
	STORAGE_NEWEST_NAME,
	STORAGE_POSTS_NAME,
	POSTS_REQUEST_EVENT_NAME,
	POSTS_FETCHED_EVENT_NAME,
	INCOM_ONMOUNTED_EVENT_NAME,
};
