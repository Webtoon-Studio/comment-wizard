import { getSessionFromCookie } from "@shared/global";

interface AuthorProfileImage {
    domain: string; // e.g. "https://g-wcommunity.pstatic.net"
    shareDomain: string; // e.g. "https://g-swcommunity-phinf.pstatic.net"
    path: string; // e.g. "/20220315_200/16473221036726eola_JPEG/image.jpg"
}

export interface Author {
    publisherType: string; // e.g. "PAGE",
    id: string; // e.g. "67lva",
    status: string; // e.g. "SERVICE"
    cuid: string; // e.g. "549ecbe0-15d1-11e6-ba38-000000001a8c",
    name: string; // e.g. "kyo_trashbunny"
    profileUrl: string; // e.g. "kyo"
    isCreator: boolean;
    isPageOwner: boolean;
    maskedUserId: string; // e.g. "549e****"
    encUserId: string; // need more info
    profileImageUrl: string; // e.g. "https://g-wcommunity.pstatic.net/20220315_200/16473221036726eola_JPEG/image.jpg
    profileImage: AuthorProfileImage;
    extraList: any[]; // need more info
    restriction: any; // need more info
}

export async function fetchProfileUrlFromUserInfo(session: string | null = null): Promise<string | null> {
    const url = "https://www.webtoons.com/en/member/userInfo";
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
        headers
    };

    const resp = await fetch(url, options);
    if (!resp.ok) {
        console.error(`Error ${resp.status}: ${resp.statusText}`);
        return null;
    }
    
    const userinfo = await resp.json();

    return userinfo.profileUrl;
}

export async function parseAuthorIdFromProfilePage(profileUrl: string, session: string | null = null): Promise<string | null> {
    // Scrape the Creator Profile page for the author ID
    const isDomAvail = globalThis.hasOwnProperty("DOMParser");
    const url = `https://www.webtoons.com/p/community/en/u/${profileUrl}`;
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
        headers
    };

    const resp = await fetch(url, options);
    if (!resp.ok) {
        console.error(`Error ${resp.status}: ${resp.statusText}`);
        return null;
    }

    const html = await resp.text();
    var cid = undefined;

    if (isDomAvail) {
        const dom = new DOMParser();
        const doc = dom.parseFromString(html, "text/html");
        const scripts = doc.getElementsByTagName("script");
        for (let s of scripts) {
            const match = s.innerText.match(/\\\"creatorId\\\":\\\"(?<creatorId>[^\\\"]+)\\\"/);
            
            if (match && match.groups) {
                cid = match.groups["creatorId"];
                break;
            }
        }
        if (cid !== undefined) {
            return cid;
        } else {
            console.error("Failed to find a creatorId. Perhaps something changed?");
            return null;
        }
    }

    // Use Regex to parse since the info is embedded in a script tag
    const re = /\\\"creatorId\\\":\\\"(?<creatorId>[^\\\"]+)\\\"/;
    const match = html.match(re);
    if (match === null || match.groups === undefined) {
        console.error("Failed to find a creatorId. Perhaps something changed?");
        return null;
    }
    cid = match.groups["creatorId"];

    // TODO: perhaps a validation of the id?

    return cid;
}