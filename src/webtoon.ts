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

import { getCurrentUserSession } from "@root/src/global";
import {
	type PageIdType,
	Post,
	type PostIdType,
	type PostResponse,
} from "@root/src/post";

export class Webtoon {
	readonly url: string;

	type: "c" | "w";
	id: `${number}`; // webtoon title id

	// initialized as null first. Must call getEpisodesCount first!
	episodes: number | null;

	constructor(url: string) {
		this.url = url;

		const regex =
			"/https:\\/\\/www.webtoons.com\\/ww\\/(w+)\\/.+\\/list?title_no=(d+)/";

		const matches = url.match(regex);

		if (matches && matches.length !== 2) {
			if (matches[1] === "canvas") {
				this.type = "c";
			} else {
				this.type = "w";
			}

			this.id = matches[2] as `${number}`;
		} else {
			const msg = `Provided URL ${url} did not follow specification of https://webtoons.com/../(canvas|genre)/.../list?title_no=(NUMBER)`;
			throw new Error(msg);
		}

		this.episodes = null;
	}

	async getEpisodeCount() {
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
				this.episodes = Number.parseInt(episode, 10);
			} else {
				throw new Error(
					`Failed to find "data-episode-no" from the item: ${item}`,
				);
			}
		} else {
			throw new Error(`Failed to find episodes from page of ${this.url}`);
		}
	}

	async getPosts() {
		const posts = new Set<Post>();

		let episode = 1;

		episodes: while (true) {
			const url = postUrl(this.type, this.id, episode);

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

			while (next !== undefined) {
				const url = postUrl(this.type, this.id, episode, next);

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
			}

			episode += 1;
		}

		return [...posts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}

	async getTodaysOrNewestPosts() {
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0);

		const posts = new Set<Post>();

		let episode = 1;

		episodes: while (true) {
			const url = postUrl(this.type, this.id, episode);

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

			while (next !== undefined && !found) {
				const url = postUrl(this.type, this.id, episode, next);

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
			}

			episode += 1;
		}

		return [...posts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}

	async getNewestsPosts(
		prev_newest_map: Map<number, PostIdType>,
	): Promise<Post[]> {
		const posts: Post[] = [];

		let episode = 1;

		const did = { reach_end: false };

		while (true && !did.reach_end) {
			const prevNewestPost = prev_newest_map.get(episode);
			if (prevNewestPost) {
				const episode_posts = await this.getNewestPostsForEpisode(
					episode,
					prevNewestPost,
					did,
				);

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

	async getNewestPostsForEpisode(
		episode: number,
		prev_newest_post: PostIdType,
		did: { reach_end: boolean },
	): Promise<Post[]> {
		if (!this.id || !this.type) {
			console.error(
				"Unable to get newst posts for episode: undefined id and/or type field(s)",
			);
			return [];
		}

		const posts: Post[] = [];

		const url = postUrl(this.type, this.id, episode);

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
			const url = postUrl(this.type, this.id, episode, next);

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

export function postUrl(
	type: "c" | "w",
	webtoonId: `${number}`,
	episode: number,
	cursor?: PostIdType,
) {
	const pageId: PageIdType = `${type}_${webtoonId}_${episode}`;
	const baseUrl = "https://www.webtoons.com/p/api/community/v2";
	const defaultQuery = "pinRepresentation=none&prevSize=0&nextSize=100";
	return `${baseUrl}/posts?pageId=${pageId}&${defaultQuery}&cursor=${
		cursor || ""
	}&withCusor=true`;
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
