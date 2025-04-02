import { STORAGE_TITLES_NAME, STROAGE_COUNT_NAME, STORAGE_WEBTOONS_NAME } from "@shared/global";
import { PostCountType } from "@shared/post";
import { Title } from "@shared/title";
import { TitleIdType, StoredWebtoonData } from "@shared/webtoon";

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
export async function loadPostCounts(): Promise<PostCountType[] | null> {
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

export async function savePostCounts(postCounts: PostCountType[]) {
    if (chrome.storage) {
        return chrome.storage.sync.set({
            [STROAGE_COUNT_NAME]: postCounts,
        });
    }
}
// ================================================================================ //

// ================================================================================ //
export async function loadWebtoons(titleId?: TitleIdType): Promise<StoredWebtoonData[]> {
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

export async function saveWebtoons(data: StoredWebtoonData[]) {
    if (chrome.storage) {
        await chrome.storage.local.set({
            [STORAGE_WEBTOONS_NAME]: data
        });
    }
}
// ================================================================================ //
