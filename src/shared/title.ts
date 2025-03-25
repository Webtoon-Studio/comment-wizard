import { getSessionFromCookie } from "@shared/global";

export interface TitleAuthor {
    nickname: string;
}

interface TitleExtra {
    episodeListPath: string;
    restTerminationStatus: string; // e.g. SERIES
    unsuitableForChildren: boolean;
}

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
}

type TitleResponseType = {
    status: string, // e.g. success
    result: {
        titles: ITitle[],
        totalCount: number
    }
};

export class Title implements ITitle {
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
    
    constructor(title: ITitle) {
        this.authors = title.authors;
        this.extra = title.extra;
        this.genres = title.genres;
        this.grade = title.grade;
        this.id = title.id;
        this.recentEpisodeRegisteredAt = title.recentEpisodeRegisteredAt;
        this.representGenre = title.representGenre;
        this.shareThumbnailUrl = title.shareThumbnailUrl;
        this.subject = title.subject;
        this.thumbnailUrl = title.thumbnailUrl;
        this.titleRegisteredAt = title.titleRegisteredAt;
    }

    equals(obj: Title) {
        for (const k of Object.keys(this) as (keyof Title)[]) {
            if (this[k] !== obj[k]) return false;
        }
        return true;
    }

    static isTitle(o: unknown) {
        if (o === undefined || o === null || typeof o !== "object") return false;

        const obj = o as Record<string, unknown>;

        for (const k in Object.keys(this) as (keyof Title)[]) {
            if (!(k in obj) || obj[k] === undefined) return false;
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
