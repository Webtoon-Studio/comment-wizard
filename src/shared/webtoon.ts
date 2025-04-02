import { getCurrentUserSession, getSessionFromCookie, isPostIdNewer } from "@root/src/shared/global";
import {
	type PageIdType,
	Post,
	type PostIdType,
	type IWebtoonPost,
	type PostCountType,
	type EpisodeCountType,
	IPost,
} from "@root/src/shared/post";
import { Semaphore } from "./semaphore";
import type { Title } from "@shared/title";

export type TitleIdType = `${number}`;

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

type GetPostErrorType = {
	timestamp: number;
	lastPostId?: PostIdType;
}

export interface StoredWebtoonData {
	titleId: string;
	posts: Post[];
}

export class Webtoon {
	readonly url: string;

	readonly type: "c" | "w";
	readonly titleId: TitleIdType; // webtoon title id

	status: "idle" | "fetching" | "error";
	episodeCount: number = -1;
	posts: Map<number, Post[]>;
	errors: Map<number, GetPostErrorType>;

	constructor(
		title: Title,
	) {
		this.url = "https://www.webtoons.com/" + title.extra.episodeListPath;
		this.titleId = title.id;
		this.type = title.grade === "CHALLENGE" ? "c" : "w";

		this.status = "idle";
		this.posts = new Map<number, Post[]>();
		this.errors = new Map<number, GetPostErrorType>();

		this.getEpisodeCount();
	}

	async getEpisodeCount() {
		// TODO: Use a better way to check if DOMParser is available
		// eslint-disable-next-line no-prototype-builtins
		const isDomAvail = globalThis.hasOwnProperty("DOMParser");
		const response = await fetch(this.url, {
			credentials: "include",
		});

		const html = await response.text();

		if (isDomAvail) {
			const dom = new DOMParser();
			const doc = dom.parseFromString(html, "text/html");
			const item = doc.querySelector("li._episodeItem");
	
			if (item) {
				const episode = item.getAttribute("data-episode-no");
				if (episode) {
					this.episodeCount = Number.parseInt(episode, 10);
				} else {
					throw new Error(
						`Failed to find "data-episode-no" from the item: ${item}`,
					);
				}
			} else {
				throw new Error(`Failed to find episodes from page of ${this.url}`);
			}
		} else {
			const re = /<li class="_episodeItem"[^>]*data-episode-no="(?<episodeNo>\d+)"/i
			const match = re.exec(html);
			if (match && match.groups) {
				const episode = match.groups["episodeNo"];
				if (episode.trim()) {
					this.episodeCount = Number.parseInt(episode, 10);
				} else {
					throw new Error(
						`"data-episode-no" value is empty`
					);
				}
			} else {
				throw new Error(`Failed to find episode from the page of ${this.url}`);
			}
		}
	}

	async getPosts(
		episodeNum: number,
		cursor?: PostIdType,
		prevNewestPost?: PostIdType
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
	
			// await some time
            await new Promise(resolve => setTimeout(resolve, 300));

			const resultPosts = json.result.posts as IWebtoonPost[];
			const posts = resultPosts.map((p) => new Post(p));
	
			posts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
	
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
				return this.getPosts(episodeNum, next, newNewestPost ? undefined : prevNewestPost);
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
			console.warn("Busy: 'getAllPosts' aborted");
			return;
		}

		if (this.status === 'error') {
			await this.resolveErrors();
			if (this.status === 'error') {
				console.warn("Resolving errors failed: 'getAllPosts' aborted");
				return;
			}
		}

		this.status = 'fetching';

		// service worker terminates when a single request takes >5m
		const startTime = new Date().getTime();
		let endTime = new Date().getTime();
		const maxTotalAllowedTime = 30 * 60 * 1000; // 30 minutes
		const maxSingleRequestAllowedTime = 4 * 60 * 1000; // 4 minutes

		if (this.episodeCount > 0) {
			for (let episodeNum = start; episodeNum <= this.episodeCount; episodeNum++) {
				const result = await this.getPosts(episodeNum);

				if (result.status === "fail") {
					this.status = 'error';
					this.errors.set(episodeNum, {
						timestamp: new Date().getTime(),
						lastPostId: result.newestPost,
					} satisfies GetPostErrorType);
					continue;
				}
	
				endTime = new Date().getTime();
				if (endTime - startTime > maxSingleRequestAllowedTime) {
					this.status = 'error';
					this.errors.set(episodeNum,{
						timestamp: new Date().getTime()
					} satisfies GetPostErrorType);
					break;
				}
			}
		} else {
			let episodeNum = start;
			main: while (endTime - startTime < maxTotalAllowedTime) {
				const result = await this.getPosts(episodeNum);
				
				switch (result.status) {
					case 'fail':
						this.status = 'error';
						this.errors.set(episodeNum, {
							timestamp: new Date().getTime(),
							lastPostId: result.newestPost,
						} satisfies GetPostErrorType);
						break main;
					case 'done':
						this.episodeCount = episodeNum;
						break main;
				}
	
				episodeNum++;

				// Elapsed time check
				// Placed after episodeNum++ since we want to resolve from the next episode
				endTime = new Date().getTime();
				if (endTime - startTime > maxSingleRequestAllowedTime) {
					this.status = 'error';
					this.errors.set(episodeNum,{
						timestamp: new Date().getTime()
					} satisfies GetPostErrorType);
					break;
				}
			}
		}
	}

	async resolveErrors() {
		if (this.status === 'fetching') {
			console.warn("Busy: 'resolveErrors' aborted");
			return;
		}

		for (const [episodeNum, error] of this.errors.entries()) {
			const result = await this.getPosts(episodeNum, error.lastPostId);
			if (result.status === "fail") {
				this.status = 'error';
				this.errors.set(episodeNum, {
					timestamp: new Date().getTime(),
					lastPostId: result.newestPost,
				} satisfies GetPostErrorType);
				continue;
			}
			if (result.status === "done") {
				this.errors.delete(episodeNum);
			}
		}
	}

	async _getTodaysOrNewestPosts() {
		// TODO: Add a way to get the newest posts from the last time it was fetched.
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0);

		const posts = new Set<Post>();

		let episode = 1;

		// 1 episode at a time.
		const episode_semaphore = new Semaphore(1);

		// eslint-disable-next-line no-constant-condition
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

	assignPosts(posts: Post[]) {
		posts.forEach(p => {
			const ex = this.posts.get(p.episode)
			if (ex) {
				this.posts.set(p.episode, [...ex, p]);
			} else {
				this.posts.set(p.episode, [p]);
			}
		});
	}

	appendPosts(episodeNum: number, newPosts: Post[]) {
		const curr = this.posts.get(episodeNum);

		// if there is an existing post & has not been modified, leave as-is
		const posts: Post[] = newPosts.map(p => {
			const ex = curr?.find(item => item.id === p.id && item.updatedAt < p.updatedAt);
			return ex ? ex : p;
		});

		this.posts.set(episodeNum, posts);
	}

	getSaveData() {
		const posts: Post[] = [];
		for (const p of this.posts.values()) {
			posts.push(...p);
		}
		return {
			titleId: this.titleId,
			posts
		} satisfies StoredWebtoonData;
	}
	
	getPostCounts() {
		let totalCount = 0;
		let totalNewCount = 0;
		let isCompleted = true;
		const episodes: EpisodeCountType[] = [];
		this.posts.forEach((episodePosts, n) => {
			let cnt = episodePosts.length;
			let newCnt = episodePosts.filter(v => v.isNew).length;
			const isEpisodeCompleted = !this.errors.has(n)
			if (!isEpisodeCompleted && isCompleted) {
				isCompleted = false;
			}

			for (const post of episodePosts) {
				cnt += post.replies.length;
				newCnt += post.replies.filter(v => v.isNew).length;
			}
			
			totalCount += cnt;
			totalNewCount += newCnt;

			episodes.push({
				number: n,
				isCompleted: isEpisodeCompleted,
				count: cnt,
				newCount: newCnt
			} satisfies EpisodeCountType);
		});
		return {
			titleId: this.titleId,
			isCompleted,
			totalCount,
			totalNewCount,
			episodes
		} satisfies PostCountType;
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
	const query: { [keyof: string]: unknown } = {
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