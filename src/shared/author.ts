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

export async function parseAuthorIdFromCreatorProfile(profileUrl: string, locale: string = "en"): Promise<string | null> {
    // Scrape the Creator Profile page for the author ID
    const url = `https://www.webtoons.com/p/community/${locale}/u/${profileUrl}`;
    const session = await getSessionFromCookie();
    if (!session) {
        console.error("Unable to get session from cookie");
        return null;
    }
    const headers = new Headers([
        ["Cookie", session]
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

    // Use Regex to parse since the info is embedded in a script tag
    const re = /\"creatorId\":\"(?<creatorId>.+?)\"/;
    const match = html.match(re);
    if (match === null || match.groups === undefined) {
        console.error("Failed to find a creatorId. Perhaps something changed?");
        return null;
    }
    const cid = match.groups["creatorId"];

    // TODO: perhaps a validation of the id?

    return cid;
}