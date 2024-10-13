/*
As of 2024-4-5 this is the shape of the posts api:
{
  "status": "success",
  "result": {
    "isPageOwner": false,
    "rootPostCount": 518,
    "activeRootPostCount": 511,
    "postCount": 893,
    "activePostCount": 880,
    "posts": [
      {
        "serviceTicketId": "epicom",
        "pageId": "w_1320_276",
        "pageUrl": "_w_1320_276",
        "isOwner": false,
        "isPinned": false,
        "commentDepth": 1,
        "depth": 1,
        "creationType": "BY_USER",
        "status": "SERVICE",
        "body": "It took me over 100 episodes but I’m finally caught up again",
        "bodyFormat": {
          "type": "PLAIN",
          "version": ""
        },
        "settings": {
          "reply": "ON",
          "reaction": "ON",
          "spoilerFilter": "OFF"
        },
        "sectionGroup": {
          "totalCount": 0,
          "sections": []
        },
       "emotions": [
            {
                "emotionId": "like",
                "count": 1,
                "reacted": false
            },
            {
                "emotionId": "dislike",
                "count": 1,
                "reacted": true
            }
        ],
        "extraList": [],
        "createdBy": {
          "publisherType": "PAGE",
          "id": "wbi2v3",
          "status": "SERVICE",
          "cuid": "2f586b40-5a1c-11eb-9de0-246e96398d40",
          "name": "Gr33nEclipse",
          "profileUrl": "_wbi2v3",
          "isCreator": false,
          "isPageOwner": false,
          "maskedUserId": "2f58****",
          "encUserId": "",
          "profileImage": {},
          "extraList": [],
          "restriction": {
            "isWritePostRestricted": false,
            "isBlindPostRestricted": false
          }
        },
        "createdAt": 1712368102285,
        "updatedAt": 1712368102285,
        "childPostCount": 0,
        "activeChildPostCount": 0,
        "pageOwnerChildPostCount": 0,
        "activePageOwnerChildPostCount": 0,
        "id": "GW-epicom:0-w_1320_276-ee",
        "rootId": "GW-epicom:0-w_1320_276-ee"
      }
    ],
    "pagination": {
      "next": "GW-epicom:0-w_1320_276-ee"
      "prev": "GW-epicom:0-w_1320_276-ed"
    }
  }
}
*/

import { getCurrentUserSession, getSessionFromCookie, isPostIdNewer } from "@root/src/shared/global";
import {
	type PageIdType,
	Post,
	type PostIdType,
	type PostResponse,
	IPost,
} from "@root/src/shared/post";
import { Semaphore } from "./semaphore";

interface PostsQueryProp {
	pageId: PageIdType;
	prevSize?: number;
	nextSize?: number;
	cursor?: PostIdType;
}

type GetPostsRepsonse = {
	status: "success" | "fail" | "done";
	newestPost?: PostIdType;
};

export class Webtoon {
	readonly url: string;

	readonly type: "c" | "w";
	readonly titleId: `${number}`; // webtoon title id

	status: "idle" | "fetching" | "error";

	lastError?: { timestamp: number; episode: number };
	postsArray: { episode: number; posts: Post[] }[];

	constructor(
		url: string, 
		lastError?: { timestamp: number; episode: number },
		postsArray?: { episode: number; posts: Post[] }[]
	) {
		this.url = url;
		const regex = /https\:\/\/www\.webtoons\.com\/(?<locale>\w{2})\/(?<type>\w+)\/(?<title>.+)\/list\?title_no=(?<titleId>\d+)/i;

		const result = regex.exec(url);
		if (result && result.groups) {
			this.type = result.groups.type === 'canvas' ? 'c' : 'w';
			this.titleId = result.groups.titleId as `${number}`;

		} else {
			const msg = `Provided URL ${url} did not follow specification of https://webtoons.com/../(canvas|genre)/.../list?title_no=(NUMBER)`;
			throw new Error(msg);

		}

		this.status = lastError ? "error" : "idle";
		this.lastError = lastError;
		this.postsArray = postsArray || [];
	}

	async _getEpisodeCount() {
		const response = await fetch(this.url, {
			credentials: "include",
		});

		const html = await response.text();

		const container = document.createElement("div");
		container.innerHTML = html;

		const item = container.querySelector("li._episodeItem");

		if (item) {
			const episode = item.getAttribute("data-episode-no");
			if (episode) {
				// this.episodes = Number.parseInt(episode, 10);
			} else {
				throw new Error(
					`Failed to find "data-episode-no" from the item: ${item}`,
				);
			}
		} else {
			throw new Error(`Failed to find episodes from page of ${this.url}`);
		}
	}

	async getPosts(
		episodeNum: number,
		prevNewestPost?: PostIdType,
		cursor?: PostIdType,
	): Promise<GetPostsRepsonse> {
		// Return:
		//     - 'true': Got posts and saved
		//     - 'false': Reached 404, which may mean this is the end of episodes
		//     - 'null': Something went wrong and could not get posts
		const pageId: PageIdType = `${this.type}_${this.titleId}_${episodeNum}`;
		let newNewestPost: PostIdType | undefined;
	
		const controller = new AbortController();
		const url = generatePostsQueryUrl({ pageId, cursor });
		const session = await getSessionFromCookie();
	
		if (!session) {
			console.error("Could not get session info. Perhaps not logged in?");
			return {
				status: "fail",
			};
		}
	
		const headers = new Headers([
			["Service-Ticket-Id", "epicom"],
			["Accept-Encoding", "gzip, deflate, br, zstd"],
			["Cookie", session],
			// ["Api-Token", apiToken]
		]);
	
		// Wait 1800 ms before aborting the request
		// Service worker terminates when a fetch response takes >30s 
		const timeoutId = setTimeout(() => controller.abort(), 1800);
		const response = await fetch(url, {
			headers,
			signal: controller.signal, // To abort if takes too long
		}).catch((err) => {
			if (err.name === "AbortError") {
				console.error("Aborted: Perhaps too many request?");
				return new Response(null, { status: 408 });
			}
			console.error("Error during fetch:", err);
			return null;
		});
		clearTimeout(timeoutId);
	
		if (!response) {
			return {
				status: "fail",
			};
		}
	
		// NOTE: If an episode doesnt exist, then it will return a 404.
		// This signifies that all available episodes have been gone through.
		if (response.status === 404) {
			return {
				status: "done",
			};
		}
	
		if (response.status === 408) {
			return {
				status: "fail",
			};
		}
	
		try {
			const json = await response.json();
			if (json.status === "fail") {
				console.log(json);
				console.error("Failed to get posts from api: " + json.error);
				return {
					status: "fail",
				};
			}
	
			const resultPosts = json.result.posts as IPost[];
			const posts = resultPosts.map((p) => new Post(p));
	
			posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	
			posts.forEach((p) => {
				if (!newNewestPost && p.id) {
					if (prevNewestPost) {
						if (isPostIdNewer(p.id, prevNewestPost)) {
							newNewestPost = p.id;
						}
					} else {
						newNewestPost = p.id;
					}
				}
			});
	
			this.appendPosts(episodeNum, posts);
	
			const next = json.result.pagination.next as PostIdType;
			if (next) {
				return this.getPosts(episodeNum, newNewestPost ? undefined : prevNewestPost, next);
			}
			return {
				status: "success",
				newestPost: newNewestPost,
			};
		} catch (err) {
			console.error("Something went wrong post fetch: ", err);
			return {
				status: "fail",
				newestPost: newNewestPost,
			};
		}
	}

	async getAllPosts(start: number = 1) {
		if (this.status === 'fetching') {
			return;
		}

		if (this.status === 'error') {
			let lastAttempt = this.lastError;
			this.lastError = undefined;
			if (lastAttempt) {
				await this.getAllPosts(lastAttempt.episode);
			}
		}
		
		// episode is a one-based numbering
		// const lastEpisodeNum = Math.max(...this.postsArray.map(p => p.episode));
		let episodeNum = start;
		
		this.status = 'fetching';
		// service worker terminates when a single request takes >5m
		const startTime = new Date().getTime();
		let endTime = new Date().getTime();
		main: while (endTime - startTime < (30 * 60 * 1000)) {
			const result = await this.getPosts(episodeNum);
			
			switch (result.status) {
				case 'fail':
					this.status = 'error';
					this.lastError = {
						timestamp: new Date().getTime(),
						episode: episodeNum
					};
					break main;
				case 'done':
					break main;
			}

			episodeNum++;

			endTime = new Date().getTime();
			if (endTime - startTime > (4 * 60 * 1000)) {
				this.status = 'error';
				this.lastError = {
					timestamp: new Date().getTime(),
					episode: episodeNum
				};
				break;
			}
		}
	}

	async _getPosts() {
		const posts = new Set<Post>();

		let episode = 1;

		// One episode at a time.
		const episode_semaphore = new Semaphore(1);

		episodes: while (true) {
			await episode_semaphore.acquire();

			const url = generatePostsQueryUrl({pageId: `${this.type}_${this.titleId}_${episode}`});

			const response = await webtoonFetch(url);

			// NOTE: If an episode doesnt exist, then it will return a 404.
			// This signifies that all available episodes have been gone through.
			if (response.status === 404) {
				break;
			}

			const json = (await response.json()) as PostResponse;

			if (json.status === "fail") {
				console.log(json);
				throw new Error(`Failed to get posts from api: ${json.error}`);
			}

			for (const post of json.result.posts) {
				posts.add(new Post(post));
			}

			let next = json.result.pagination.next;

			// 10 "pages" at a time
			const semaphore = new Semaphore(10);

			while (next !== undefined) {
				await semaphore.acquire();

				const url = generatePostsQueryUrl({
					pageId: `${this.type}_${this.titleId}_${episode}`,
					cursor: next
				});

				const response = await webtoonFetch(url);

				// NOTE: If an episode doesnt exist, then it will return a 404.
				// This signifies that all available episodes have been gone through.
				if (response.status === 404) {
					break episodes;
				}

				const json = (await response.json()) as PostResponse;

				if (json.status === "success") {
					for (const post of json.result.posts) {
						posts.add(new Post(post));
					}

					next = json.result.pagination.next;
				} else {
					console.error(`Unable to fetch the next pagination with: ${next}`);
					next = undefined;
				}

				semaphore.release();
			}

			episode += 1;

			episode_semaphore.release();
		}

		return [...posts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}

	async _getTodaysOrNewestPosts() {
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0);

		const posts = new Set<Post>();

		let episode = 1;

		// 1 episode at a time.
		const episode_semaphore = new Semaphore(1);

		episodes: while (true) {
			await episode_semaphore.acquire();

			const url = generatePostsQueryUrl({pageId: `${this.type}_${this.titleId}_${episode}`});

			const response = await webtoonFetch(url);

			// NOTE: If an episode doesnt exist, then it will return a 404.
			// This signifies that all available episodes have been gone through.
			if (response.status === 404) {
				break;
			}

			const json = await response.json();

			if (json.status === "fail") {
				console.log(json);
				throw new Error(`Failed to get posts from api: ${json.error}`);
			}

			let found = false;
			let added_at_least_first_post = false;

			for (const post of json.result.posts) {
				if (post.createdAt >= today.getTime() || !added_at_least_first_post) {
					posts.add(new Post(post));
					added_at_least_first_post = true;
				}

				found = true;
				break;
			}

			let next = json.result.pagination.next;

			// 10 "pages" at a time.
			const semaphore = new Semaphore(10);

			while (next !== undefined && !found) {
				await semaphore.acquire();

				const url = generatePostsQueryUrl({
					pageId: `${this.type}_${this.titleId}_${episode}`, 
					cursor: next
				});

				const response = await webtoonFetch(url);

				// NOTE: If an episode doesnt exist, then it will return a 404.
				// This signifies that all available episodes have been gone through.
				if (response.status === 404) {
					break episodes;
				}

				const json = await response.json();

				for (const post of json.result.posts) {
					if (post.createdAt >= today.getTime()) {
						posts.add(new Post(post));
					}

					found = true;
					break episodes;
				}

				next = json.result.pagination.next;

				semaphore.release();
			}

			episode += 1;

			episode_semaphore.release();
		}

		return [...posts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}

	async _getNewestsPosts(
		prev_newest_map: Map<number, PostIdType>,
	): Promise<Post[]> {
		const posts: Post[] = [];

		let episode = 1;

		const did = { reach_end: false };

		const semaphore = new Semaphore(10);

		while (true && !did.reach_end) {
			const prevNewestPost = prev_newest_map.get(episode);
			if (prevNewestPost) {
				await semaphore.acquire();

				const episode_posts = await this._getNewestPostsForEpisode(
					episode,
					prevNewestPost,
					did,
				);

				semaphore.release();

				for (const post of episode_posts) {
					posts.push(post);
				}

				episode += 1;
			} else {
				console.error(
					`Unable to get newst posts for episode ${episode}.\nThere is no such key in the prev newst map!`,
				);
				break;
			}
		}

		return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}

	async _getNewestPostsForEpisode(
		episode: number,
		prev_newest_post: PostIdType,
		did: { reach_end: boolean },
	): Promise<Post[]> {
		if (!this.titleId || !this.type) {
			console.error(
				"Unable to get newst posts for episode: undefined id and/or type field(s)",
			);
			return [];
		}

		const posts: Post[] = [];

		const url = generatePostsQueryUrl({pageId: `${this.type}_${this.titleId}_${episode}`});

		const response = await webtoonFetch(url);

		// NOTE: If an episode doesnt exist, then it will return a 404.
		// This signifies that all available episodes have been gone through.
		if (response.status === 404) {
			did.reach_end = true;
			return posts;
		}

		const json = await response.json();

		if (json.status === "fail") {
			console.log(json);
			throw new Error(`Failed to get posts from api: ${json.error}`);
		}

		let found = false;

		for (const post of json.result.posts) {
			if (post.id === prev_newest_post) {
				found = true;
				break;
			}

			posts.push(new Post(post));
		}

		let next = json.result.pagination.next;

		while (!found && next !== undefined) {
			const url = generatePostsQueryUrl({
				pageId: `${this.type}_${this.titleId}_${episode}`,
				cursor: next
			});

			const response = await webtoonFetch(url);
			const json = await response.json();

			for (const post of json.result.posts) {
				if (post.id === prev_newest_post) {
					break;
				}

				posts.push(new Post(post));
			}

			next = json.result.pagination.next;
		}

		return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}

	appendPosts(episodeNum: number, newPosts: Post[]) {
		const exPosts = this.postsArray.find(item => item.episode === episodeNum)?.posts;

		// if there is an existing post & has not been modified, leave as-is
		const posts: Post[] = newPosts.map(p => {
			const ex = exPosts?.find(item => item.id === p.id);
			if (ex && ex.body === p.body) {
				return ex;
			} else {
				return p;
			}
		});

		this.postsArray = [
			...this.postsArray.filter(item => item.episode !== episodeNum), 
			{episode: episodeNum, posts}
		];

		this.postsArray.sort((a, b) => b.episode - a.episode);
	}
}

export async function webtoonFetch(url: string) {
	const session = await getCurrentUserSession();

	if (session === null) {
		throw new Error("Failed to get current user session from cookie");
	}

	const headers = new Headers();
	headers.append("Service-Ticket-Id", "epicom");
	headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
	headers.append("Cookie", session);

	return fetch(url, { headers: headers });
}

export function generatePostsQueryUrl(queryProp: PostsQueryProp) {
	const { pageId, prevSize = 0, nextSize = 100, cursor = "" } = queryProp;
	const baseUrl = "https://www.webtoons.com/p/api/community/v2";
	const query: { [keyof: string]: any } = {
		pageId,
		pinRepresentation: "none",
		prevSize,
		nextSize,
		cursor,
		withCursor: true,
	};
	const queryPath = Object.keys(query)
		.map((key) => `${key}=${query[key]}`)
		.join("&");

	`pinRepresentation=none&prevSize=0&nextSize=100`;
	return `${baseUrl}/posts?${queryPath}`;
}

// {
//   "serviceTicketId": "epicom",
//   "pageId": "w_1320_276",
//   "pageUrl": "_w_1320_276",
//   "isOwner": false,
//   "isPinned": false,
//   "commentDepth": 1,
//   "depth": 1,
//   "creationType": "BY_USER",
//   "status": "SERVICE",
//   "body": "It took me over 100 episodes but I’m finally caught up again",
//   "bodyFormat": {
//     "type": "PLAIN",
//     "version": ""
//   },
//   "settings": {
//     "reply": "ON",
//     "reaction": "ON",
//     "spoilerFilter": "OFF"
//   },
//   "sectionGroup": {
//     "totalCount": 0,
//     "sections": []
//   },
//   "reactions": [
// 					{
// 						"reactionId": "post_like",
// 						"contentId": "GW-epicom:0-w_1320_276-ee",
// 						"emotions": [
// 							{
// 								"emotionId": "like",
// 								"count": 6,
// 								"reacted": false
// 							}
// 						]
// 					}
// 		],
//   "extraList": [],
//   "createdBy": {
//     "publisherType": "PAGE",
//     "id": "wbi2v3",
//     "status": "SERVICE",
//     "cuid": "2f586b40-5a1c-11eb-9de0-246e96398d40",
//     "name": "Gr33nEclipse",
//     "profileUrl": "_wbi2v3",
//     "isCreator": false,
//     "isPageOwner": false,
//     "maskedUserId": "2f58****",
//     "encUserId": "",
//     "profileImage": {},
//     "extraList": [],
//     "restriction": {
//       "isWritePostRestricted": false,
//       "isBlindPostRestricted": false
//     }
//   },
//   "createdAt": 1712368102285,
//   "updatedAt": 1712368102285,
//   "childPostCount": 0,
//   "activeChildPostCount": 0,
//   "pageOwnerChildPostCount": 0,
//   "activePageOwnerChildPostCount": 0,
//   "id": "GW-epicom:0-w_1320_276-ee",
//   "rootId": "GW-epicom:0-w_1320_276-ee"
// }
