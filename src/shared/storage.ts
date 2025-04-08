import { STORAGE_TITLES_NAME, STROAGE_COUNT_NAME, STORAGE_WEBTOONS_NAME } from "@shared/global";
import { IPost, Post, PostCountType } from "@shared/post";
import { Title } from "@shared/title";
import { TitleIdType, StoredWebtoonData } from "@shared/webtoon";

// ================================= GLOBAL VARS ================================= //
const STORAGE_APP_STATE_NAME = "cs-app-state";
const STORAGE_CONTENT_SETTING_NAME = "cs-content-settings";
const STORAGE_WORKER_SETTING_NAME = "cs-worker-settings";
const STORAGE_STATUS_NAME = "cs-status";
const STORAGE_TITLES_NAME = "cs-title-items";
const STORAGE_NEWEST_NAME = "cs-newest-posts";
const STROAGE_COUNT_NAME = "cs-post-counts";
const STORAGE_POSTS_NAME = "cs-all-posts";
const STORAGE_WEBTOONS_NAME = "cs-webtoons";
// ================================================================================ //
// ============================== TITLES LOAD / SAVE ============================== //
export async function loadTitles(): Promise<Title[] | null> {
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

export async function saveTitles(titles: Title[]) {
    if (chrome.storage) {
        return chrome.storage.sync.set({
            [STORAGE_TITLES_NAME]: titles,
        });
    }
}

export async function cleanTitles(): Promise<boolean> {
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
export async function loadPostCounts(): Promise<PostCountType[]> {
    if (chrome.storage) {
        return chrome.storage.local.get().then((items) => {
            const ret: PostCountType[] = [];
            Object.keys(items).forEach((key) => {
                if (key.startsWith(STROAGE_COUNT_NAME)) {
                    const counts = items[key];
                    ret.push(counts as PostCountType)
                }
            });
            return ret;
        });
    }
    return [];
}

export async function loadPostCountsById(titleId: TitleIdType): Promise<PostCountType|null> {
    if (chrome.storage) {
        const key = STROAGE_COUNT_NAME + "-" + titleId;
        return chrome.storage.local.get(key).then((items) => {
            if (key in items) {
                return items[key];
            }
            return null;
        });
    }
    return null;
}

export async function savePostCounts(postCounts: PostCountType[]) {
    if (chrome.storage) {
        const prepped = postCounts.reduce<{[key:string]:PostCountType}>((p,c) => {
            p[STROAGE_COUNT_NAME + "-" + c.titleId] = c
            return p;
        }, {})
        await chrome.storage.local.set(prepped);
    }
}
// ================================================================================ //

// ================================================================================ //
export async function loadWebtoons(): Promise<StoredWebtoonData[]> {
    if (chrome.storage) {
        return chrome.storage.local.get().then((items) => {
            const ret: StoredWebtoonData[] = []
            Object.keys(items).forEach((key) => {
                if (key.startsWith(STORAGE_WEBTOONS_NAME)) {
                    const titleId = key.substring(STORAGE_WEBTOONS_NAME.length) as TitleIdType;
                    const posts = items[key];
                    if (Array.isArray(posts)) {
                        ret.push({
                            titleId,
                            posts: posts.map(p => new Post(p))
                        });
                    }
                }
            });
            return ret;
        });
    }
    return [];
}

export async function loadWebtoonById(titleId: TitleIdType): Promise<StoredWebtoonData|null> {
    if (chrome.storage) {
        const key = STORAGE_WEBTOONS_NAME + "-" + titleId;
        return chrome.storage.local.get(key).then((items) => {
            if (key in items) {
                return items[key];
            }
            return null;
        });
    }
    return null;
}

export async function saveWebtoons(data: StoredWebtoonData[]) {
    if (chrome.storage) {
        const prepped = data.reduce<{[key:string]: StoredWebtoonData}>((p,c) => {
            p[STORAGE_WEBTOONS_NAME + "-" + c.titleId] = c
            return p;
        }, {})
        await chrome.storage.local.set(prepped);
    }
}
// ================================================================================ //

export {
	STORAGE_APP_STATE_NAME,
	STORAGE_CONTENT_SETTING_NAME,
	STORAGE_WORKER_SETTING_NAME,
	STORAGE_STATUS_NAME,
	STORAGE_TITLES_NAME,
	STORAGE_NEWEST_NAME,
	STROAGE_COUNT_NAME,
	STORAGE_POSTS_NAME,
	STORAGE_WEBTOONS_NAME,
};