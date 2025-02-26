import { getSessionFromCookie } from "@shared/global";

export interface TitleAuthor {
    nickname: string;
}

interface TitleExtra {
    episodeListPath: string;
    restTerminationStatus: string; // e.g. SERIES
    unsuitableForChildren: boolean;
};

export interface ITitle {
    authors: TitleAuthor[];
    extra: TitleExtra;
    genres: string[]; // e.g. DRAMA
    grade: string; // e.g. CHALLENGE
    id: `${number}`;
    recentEpisodeRegisteredAt: number;
    representGenre: string; // e.g. DRAMA
    shareThumbnailUrl: string;
    subject: string;
    thumbnailUrl: string;
    titleRegisteredAt: number;
};

type TitleResponseType = {
    status: string, // e.g. success
    result: {
        titles: ITitle[],
        totalCount: number
    }
};

export interface Title extends Object, ITitle { [index: string]: any }
export class Title {
    constructor(o: any) {
        if (!Title.isTitle(o)) {
            const msg = "The object is not a Title!";
            throw new Error(msg);
        }
        Object.assign(this, o || {}); 
    }

    equals(obj: Title) {
        for (let k of Object.keys(this)) {
            if (this[k] !== obj[k]) return false;
        }
        return true;
    }

    static isTitle(o: any) {
        if (typeof o !== "object") return false;

        for (let key in Object.keys(this)) {
            if (!o.hasOwnProperty(key) || o[key] === undefined) return false;
        }

        return true;
    }
}

export async function fetchWebtoonTitles(creatorId: string, session: string | null = null): Promise<Title[] | null> {
    const url = `https://www.webtoons.com/p/community/api/v1/creator/${creatorId}/titles?language=ENGLISH&nextSize=50`;
    
    var _session = session;

    if (_session === null) {
        _session = await getSessionFromCookie();
        if (!_session) {
            console.error("Unable to get session from cookie");
            return null;
        }

    }
    const headers = new Headers([
        ["Cookie", _session]
    ]);
    const options: RequestInit = {
        credentials: "include",
        headers,
    };

    const resp = await fetch(url, options);
    if (!resp.ok) {
        console.error(`Error ${resp.status}: ${resp.statusText}`);
        return null;
    }

    const data = await resp.json() as TitleResponseType;

    return data.result.titles.map(value => new Title(value));
}
