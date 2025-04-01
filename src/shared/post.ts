import { getApiToken, getSessionFromCookie } from "@shared/global";
import { webtoonFetch, type TitleIdType } from "@shared/webtoon";

export type EpisodeCountType = {
	number: number,
	isCompleted: boolean,
	count: number, 
	newCount: number
};
export type PostCountType = {
	titleId: `${number}`,
	isCompleted: boolean,
	totalCount: number,
	totalNewCount: number,
	episodes: EpisodeCountType[]
};

export type PageIdType = `${"w" | "c"}_${number}_${number}`;
export type PostIdType = `GW-epicom:${number}-${PageIdType}-${string}`;
export type PageUrlType = `_${PageIdType}`;
export type PostStatusType = "SERVICE" | "DELETE" | string;
export type CreatedByStatusType = "SERVICE" | "END" | string;
export type BodyFormatType = { 
	type: string, // e.g. "PLAIN" // TODO: Specify more?
	version: string // e.g. ""
};
export type SettingValueType = "ON" | "OFF"; // Guessing the type here. Revisit if error

export interface GeneralPostSettings {
	[key: string]: SettingValueType
}

export interface PostSettings extends GeneralPostSettings {
	reply: SettingValueType;
	reaction: SettingValueType;
	spoilerFilter: SettingValueType;
}

export type SectionDataType = {
	giphyId: string;
	title: string;
	rendering: {
		url: string;
		width: number;
		height: number;
	};
	thumbnail: {
		url: string;
		width: number;
		height: number;
	}
}

export type SectionType = {
	sectionId: string; // e.g. "1"
	sectionType: string | "GIPHY";
	priority: number;
	data: SectionDataType;

} 

export type SectionGroupType = {
	totalCount: number;
	sections: unknown[]; // TODO: Specify type of the array?
}

export type EmotionType = {
	emotionId: string; //e.g. "like" // TODO: Specify more?
	count: number;
	reacted: boolean;
}

export type ReactionType = {
	reactionId: string; // e.g. "post_like" // TODO: Specify more?
	contentId: PostIdType; // e.g. "GW-epicom:0-w_1320_276-ee"
	emotions: EmotionType[];
}

export type CreatedByType = {
	publisherType: string; // e.g. "PAGE" // TODO: Specify more?
	id: string; // e.g. "wbi2v3"
	status: CreatedByStatusType; // e.g. "SERVICE" // TODO: Specify more?
	cuid: string; // e.g. "2f586b40-5a1c-11eb-9de0-246e96398d40"
	name: string; // e.g. "Gr33nEclipse"
	profileUrl: string; // e.g. "_wbi2v3"
	isCreator: boolean; // Poster is a creator
	isPageOwner: boolean; // Poster is the creator of the series this post is in
	maskedUserId: string; // e.g. "2f58****"
	encUserId: string; // e.g. ""
	profileImage: object; // TODO: Specify more. Currently, not sure of the shape of this object
	extraList: unknown[]; // TODO: Specify type of the array?
	restriction: {
		isWritePostRestricted: boolean;
		isBlindPostRestricted: boolean;
	};
}

export interface IWebtoonPost {
	serviceTicketId: "epicom";
	pageId: PageIdType; // e.g. "w_1320_276"
	pageUrl: PageUrlType; // e.g. "_w_1320_276"
	isOwner: boolean;
	isPinned: boolean;
	commentDepth: number;
	depth: number;
	creationType: string; // e.g. "BY_USER" // TODO: Specify more?
	status: PostStatusType; // e.g. "SERVICE" // TODO: Specify more?
	body: string;
	bodyFormat: BodyFormatType;
	settings: PostSettings;
	sectionGroup: SectionGroupType;
	reactions: ReactionType[];
	extraList: unknown[]; // TODO: Specify type of the array?
	createdBy: CreatedByType;
	createdAt: number; // e.g. 1712368102285
	updatedAt: number; // e.g. 1712368102285
	childPostCount: number;
	activeChildPostCount: number;
	pageOwnerChildPostCount: number;
	activePageOwnerChildPostCount: number;
	id: PostIdType; // e.g. "GW-epicom:0-w_1320_276-ee"
	rootId: PostIdType; // e.g. "GW-epicom:0-w_1320_276-ee"
	
}

export interface IWizardPost {
	titleId: TitleIdType;
	titleType: "w" | "c";
	episode: number;
	isNew: boolean;
	isUpdated: boolean;
	isGone: boolean;
	likes: number;
	dislikes: number;
	hasLiked: boolean;
	hasDisliked: boolean;
}


interface PostSuccessResponse {
	status: "success";
	result: {
		posts: IWebtoonPost[];
		pagination: {
			next?: PostIdType;
			prev?: PostIdType;
		};
		activeChildPostCount: number;
		childPostCount: number;
		isPageOwner: boolean;
	};
}

interface PostFailResponse {
	status: "fail";
	error: {
		code: string;
		typeMessage: string;
	};
}

export type PostResponse = PostSuccessResponse | PostFailResponse;

export interface IPost extends IWebtoonPost, IWizardPost {}
export class Post implements IPost {
	id: `GW-epicom:${number}-w_${number}_${number}-${string}` | `GW-epicom:${number}-c_${number}_${number}-${string}`;
	rootId: `GW-epicom:${number}-w_${number}_${number}-${string}` | `GW-epicom:${number}-c_${number}_${number}-${string}`;
	titleId: `${number}`;
	serviceTicketId: "epicom";
	pageId: `w_${number}_${number}` | `c_${number}_${number}`;
	pageUrl: `_w_${number}_${number}` | `_c_${number}_${number}`;
	isOwner: boolean;
	isPinned: boolean;
	commentDepth: number;
	depth: number;
	creationType: string;
	status: string;
	body: string;
	bodyFormat: BodyFormatType;
	settings: PostSettings;
	sectionGroup: SectionGroupType;
	reactions: ReactionType[];
	extraList: unknown[];
	createdBy: CreatedByType;
	createdAt: number;
	updatedAt: number;
	childPostCount: number;
	activeChildPostCount: number;
	pageOwnerChildPostCount: number;
	activePageOwnerChildPostCount: number;
	titleType: "w" | "c";
	episode: number;
	isNew: boolean;
	isUpdated: boolean;
	isGone: boolean;
	likes: number;
	dislikes: number;
	hasLiked: boolean;
	hasDisliked: boolean;

	replies: Post[];

	constructor(raw: Post | IWebtoonPost) {
		this.id = raw.id;
		this.rootId = raw.rootId;
		this.serviceTicketId = raw.serviceTicketId;
		this.pageId = raw.pageId;
		this.pageUrl = raw.pageUrl;
		this.isOwner = raw.isOwner;
		this.isPinned = raw.isPinned;
		this.commentDepth = raw.commentDepth;
		this.depth = raw.depth;
		this.creationType = raw.creationType;
		this.status = raw.status;
		this.body = raw.body;
		this.bodyFormat = raw.bodyFormat;
		this.settings = raw.settings;
		this.sectionGroup = raw.sectionGroup;
		this.reactions = raw.reactions;
		this.extraList = raw.extraList;
		this.createdBy = raw.createdBy;
		this.createdAt = raw.createdAt;
		this.updatedAt = raw.updatedAt;
		this.childPostCount = raw.childPostCount;
		this.activeChildPostCount = raw.activeChildPostCount;
		this.pageOwnerChildPostCount = raw.pageOwnerChildPostCount;
		this.activePageOwnerChildPostCount = raw.activePageOwnerChildPostCount;


		this.isNew = true; // Initialize the Post as new
		this.isUpdated = false;
		this.isGone = false; // Initialize the Post as not gone
		this.replies = [];

		if (this.pageId === undefined) {
			throw new TypeError("Invalid Property: The property pageId is undefined!");
		}

		const splits = raw.pageId.split("_");

		const titleType = splits[0];
		const titleId = splits[1];
		const episode = splits[2];

		// Type check
		if (
			(titleType !== "w" && titleType !== "c") ||
			!/^\d+$/.exec(titleId) ||
			!/^\d+$/.exec(episode)
		) {
			throw new TypeError(
				`Invalid Property: The pageId (${raw.pageId}) is not in the expected format (w_\${number}_\${number})`,
			);
		}

		let likes = 0;
		let dislikes = 0;

		let hasLiked = false;
		let hasDisliked = false;

		for (const reaction of raw.reactions) {
			if (reaction.reactionId === "post_like") {
				for (const emotion of reaction.emotions) {
					if (emotion.emotionId === "like") {
						likes = emotion.count;
						hasLiked = emotion.reacted;
					} else if (emotion.emotionId === "dislike") {
						dislikes = emotion.count;
						hasDisliked = emotion.reacted;
					} else {
						console.log(emotion);
						throw new Error('reaction emotion wasnt "like" or "dislike"');
					}
				}
			}
		}

		this.titleType = titleType;
		this.titleId = titleId as `${number}`;
		this.episode = Number.parseInt(episode);

		this.likes = likes;
		this.hasLiked = hasLiked;
		this.hasDisliked = hasDisliked;
		this.dislikes = dislikes;
	}

	get username() { return this.createdBy.name; }
	get userId() { return this.createdBy.cuid; }
	get userProfile() { return this.createdBy.profileUrl; }

	// Signifies a creator of some webtoon
	get isACreator() { return this.createdBy.isCreator; }
	// Signifies the creator of this webtoon
	get isPageOwner() { return this.createdBy.isPageOwner; }
	get isAnonymous() { return this.createdBy.name === ""; }
	get isDeleted() { return this.status === "DELETE"; }

	get replyCount() { return this.childPostCount; }
	get content() { return this.body; }

	equals(other: Post): boolean {
		return this.id === other.id;
	}

	isOutDatedThan(other: Post): boolean {
		return this.updatedAt < other.updatedAt;
	}

	markAsNew() {
		this.isNew = true;
	}

	markAsRead() {
		this.isNew = false;
	}

	async getReplies(): Promise<Post[]> {
		const appendReply = (reply: Post) => {
			const exIndex = this.replies.findIndex(r => r.id === reply.id);
			if (exIndex > -1) {
				// Update existing reply
				const combined = new Post(Object.assign(this.replies[exIndex], reply));
				combined.isUpdated = true;
				this.replies[exIndex] = combined;
			} else {
				this.replies.push(reply);
			}
		}

		if (this.id === undefined) {
			console.warn(
				"Unable to get replies: undefined id field.\nDid you perhaps construct Post wrong?",
			);
			return [];
		}

		if (this.childPostCount === 0) {
			return [];
		}

		const errorLog: string[] = [];
		const url = replyUrl(this.id);

		const response = await webtoonFetch(url);
		const json = (await response.json()) as PostResponse;

		if (json.status === "success") {
			for (const reply of json.result.posts) {
				appendReply(new Post(reply));
			}

			let next = json.result.pagination.next;

			while (next !== undefined) {
				const url = replyUrl(this.id, next);

				const response = await webtoonFetch(url);
				const json = (await response.json()) as PostResponse;

				if (json.status === "success") {
					for (const reply of json.result.posts) {
						appendReply(new Post(reply));
					}

					next = json.result.pagination.next;
				} else {
					errorLog.push(`{id: ${this.id}, next: ${next}}`);
					next = undefined;
				}
			}
		} else {
			errorLog.push(`{id: ${this.id}}`);
		}

		if (errorLog.length > 0) {
			console.error(`Failed to fetch replies:\n\t${errorLog.join("\n\t")}`);
		}

		return this.replies.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}

	async reply(message: string): Promise<Post[]> {
		if (
			this.titleType === undefined ||
			this.titleId === undefined ||
			this.episode === undefined
		) {
			console.warn(
				"Unable to reply: undefined titleType, titleId, and/or episode field(s)",
			);
			return [];
		}

		const pageId = `${this.titleType}_${this.titleId}_${this.episode}`;

		const url = "https://www.webtoons.com/p/api/community/v2/post";

		const apiToken = await getApiToken();
		if (apiToken === undefined) {
			throw new Error("Failed to get API Token");
		}

		const session = await getSessionFromCookie();
		if (session === null) {
			throw new Error("Failed to get current user session from cookie");
		}

		const headers = new Headers();
		headers.append("Service-Ticket-Id", "epicom");
		headers.append("Content-Type", "application/json");
		headers.append("Cookie", session);
		headers.append("Api-Token", apiToken);

		const request = {
			pageId,
			parentId: this.id,
			settings: {
				reply: "OFF",
				reaction: "ON",
				spoilerFilter: "OFF",
			},
			body: message,
		};

		const response = await fetch(url, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(request),
		});

		if (!response.ok) {
			console.log(this);
			console.log(await response.json());
			throw new Error("Failed to reply to post");
		}

		return await this.getReplies();
	}

	// NOTE: If you have already liked a post, then you cannot dislike it until you have unliked the post.
	async like(): Promise<{ likes: number; hasLiked: boolean } | null> {
		if (!this.id || !this.titleType || !this.titleId || !this.episode) {
			console.warn(
				"Unable to like: undefined titleType, titleId, and/or episode field(s)",
			);
			return null;
		}

		const pageId: PageIdType = `${this.titleType}_${this.titleId}_${this.episode}`;

		const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${this.id}/emotion/like`;

		const apiToken = await getApiToken();
		if (apiToken === undefined) {
			throw new Error("Failed to get API Token");
		}

		const session = await getSessionFromCookie();
		if (session === null) {
			throw new Error("Failed to get current user session from cookie");
		}

		const headers = new Headers();
		headers.append("Service-Ticket-Id", "epicom");
		headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
		headers.append("Cookie", session);
		headers.append("Api-Token", apiToken);

		let response: Response;

		if (this.hasLiked) {
			// If has already liked a post, then unlike it.
			response = await fetch(url, { method: "DELETE", headers: headers });
			this.hasLiked = false;
		} else {
			response = await fetch(url, { method: "PUT", headers: headers });
			this.hasLiked = true;
		}

		if (!response.ok) {
			// Revert property change
			this.hasLiked = !this.hasLiked;

			console.log(await response.json());
			throw new Error("Failed to like or unlike post");
		}

		const countInfo = await getCountInfo(
			this.id,
			this.titleType,
			this.titleId,
			this.episode,
			apiToken,
		);

		return {
			likes: countInfo.likes,
			hasLiked: countInfo.hasLiked,
		};
	}

	// NOTE: If you have already disliked a post, then you cannot like it until you have undisliked the post.
	async dislike() {
		if (!this.id || !this.titleType || !this.titleId || !this.episode) {
			console.error(
				"Unable to dislike: undefined id, titleType, titleId, and/or episode field(s)",
			);
			return;
		}
		const pageId = `${this.titleType}_${this.titleId}_${this.episode}`;

		const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${this.id}/emotion/dislike`;

		const apiToken = await getApiToken();
		if (apiToken === undefined) {
			throw new Error("Failed to get API Token");
		}

		const session = await getSessionFromCookie();
		if (session === null) {
			throw new Error("Failed to get current user session from cookie");
		}

		const headers = new Headers();
		headers.append("Service-Ticket-Id", "epicom");
		headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
		headers.append("Cookie", session);
		headers.append("Api-Token", apiToken);

		let response: Response;

		if (this.hasDisliked) {
			// If has already disliked a post, then undislike it.
			response = await fetch(url, { method: "DELETE", headers: headers });
			this.hasDisliked = false;
		} else {
			response = await fetch(url, { method: "PUT", headers: headers });
			this.hasDisliked = true;
		}

		if (!response.ok) {
			console.log(await response.json());
			throw new Error("Failed to dislike or undislike post");
		}

		const countInfo = await getCountInfo(
			this.id,
			this.titleType,
			this.titleId,
			this.episode,
			apiToken,
		);

		return {
			dislikes: countInfo.dislikes,
			hasDisliked: countInfo.hasDisliked,
		};
	}

	async delete() {
		// ..post/GW-epicom:0-c_843910_2-3
		const url = `https://www.webtoons.com/p/api/community/v2/post/${this.id}`;

		const session = await getSessionFromCookie();

		if (session === null) {
			throw new Error("Failed to get current user session from cookie");
		}

		const apiToken = await getApiToken();

		if (apiToken === undefined) {
			throw new Error("Failed to get api token");
		}

		const headers = new Headers();
		headers.append("Service-Ticket-Id", "epicom");
		headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
		headers.append("Cookie", session);
		headers.append("Api-Token", apiToken);

		const response = await fetch(url, { method: "DELETE", headers: headers });

		if (!response.ok) {
			throw new Error(`Failed to delete post ${this.id}`);
		}
	}

	async report() {
		throw new Error("todo");
	}

	async block() {
		const url = `https://www.webtoons.com/p/api/community/v1/restriction/type/write-post/page/${this.titleType}_${this.titleId}_${this.episode}/target/${this.userId}`;

		const session = await getSessionFromCookie();

		if (session === null) {
			throw new Error("Failed to get current user session from cookie");
		}

		const apiToken = await getApiToken();

		if (apiToken === undefined) {
			throw new Error("Failed to get api token");
		}

		const headers = new Headers();
		headers.append("Service-Ticket-Id", "epicom");
		headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
		headers.append("Cookie", session);
		headers.append("Api-Token", apiToken);

		const response = await fetch(url, {
			method: "POST",
			headers: headers,
			body: `{ "sourcePostId": ${this.id} }`,
		});

		if (!response.ok) {
			throw new Error(`Failed to block user ${this.username}`);
		}
	}

	// toJSON(): object {
	//   // This function is used by JSON.stringify
	//   // TODO: Implement this
	//   return Object.assign({}, this);
	// }

	// static revive(key: string, value: any): Post {
	//   // This function is used by JSON.parse
	//   return Post.fromCached(value);
	// }
}

// `cursor` is only provided beyond the first use of function.
function replyUrl(id: PostIdType, cursor?: PostIdType) {
	const baseUrl = "https://www.webtoons.com/p/api/community/v2/post";
	const defaultQuery = "sort=newest&prevSize=0&nextSize=100&withCursor=true";
	return `${baseUrl}/${id}/child-posts?${defaultQuery}&cursor=${cursor || ""}`;
}

async function getCountInfo(
	postId: PostIdType,
	titleType: "w" | "c",
	titleId: `${number}`,
	episode: number,
	apiToken: string,
) {
	const pageId: PageIdType = `${titleType}_${titleId}_${episode}`;

	const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${postId}/emotion/count`;

	const session = await getSessionFromCookie();

	if (session === null) {
		throw new Error("Failed to get current user session from cookie");
	}

	const headers = new Headers();
	headers.append("Service-Ticket-Id", "epicom");
	headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
	headers.append("Cookie", session);
	headers.append("Api-Token", apiToken);

	const response = await fetch(url, { method: "GET", headers: headers });

	if (!response.ok) {
		console.log(await response.json());
		throw new Error("Failed to get up to date likes and dislikes");
	}

	const json = await response.json();

	// NOTE: Example response:
	// {
	//     "status": "success",
	//     "result": {
	//         "contentId": "GW-epicom:0-c_843910_2-1",
	//         "emotions": [
	//             {
	//                 "emotionId": "like",
	//                 "count": 1,
	//                 "reacted": false
	//             },
	//             {
	//                 "emotionId": "dislike",
	//                 "count": 1,
	//                 "reacted": true
	//             }
	//         ]
	//     }
	// }

	let likes = 0;
	let dislikes = 0;

	let hasLiked = false;
	let hasDisliked = false;

	for (const emotion of json.result.emotions) {
		if (emotion.emotionId === "like") {
			likes = emotion.count;
			hasLiked = emotion.reacted;
		} else if (emotion.emotionId === "dislike") {
			dislikes = emotion.count;
			hasDisliked = emotion.reacted;
		} else {
			console.log(emotion);
			throw new Error('reaction emotion wasnt "like" or "dislike"');
		}
	}

	return {
		likes,
		hasLiked,
		dislikes,
		hasDisliked,
	};
}
