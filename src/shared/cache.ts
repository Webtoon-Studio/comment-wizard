import { Post, type IPost, type PostIdType } from "@shared/post";

export class Cache {
	posts: Post[];
	episodeNewest: Map<number, PostIdType>;
	// If there is no posts then start empty.
	// If there is no episodeNewest, then it should be a fresh install
	// and we default to no data in cache.
	constructor(posts?: Post[], episodeNewest?: Map<number, PostIdType>) {
		this.posts = posts || [];
		this.episodeNewest = episodeNewest || new Map<number, PostIdType>();
	}

	// WARN: Must be sorted where newest is index 0 before being passed in.
	store(posts: Post[]): Post[] {
		if (posts.length === 0) {
			return posts;
		}

		for (const post of posts) {
			console.log(post);
			// As the array must be stored prior to passing in
			// we can just take the first entry
			if (post.episode && post.id) {
				if (!this.episodeNewest.has(post.episode)) {
					console.log("Not in the map. Setting..");
					this.episodeNewest.set(post.episode, post.id);
				} else {
					const newestPostId = this.episodeNewest.get(post.episode);

					// TODO: Need to revisit this logic. Is `posts` containing a post that is referenced by existing `newestPostId`?
					const newest = posts.find((p) => p.id === newestPostId);
					if (
						newest &&
						post.createdAt &&
						newest.createdAt &&
						post.createdAt > newest.createdAt
					) {
						console.log("replacing");
						this.episodeNewest.set(post.episode, post.id);
					}
				}
			}
		}

		// Store only the thousand most newest.
		this.posts = posts.slice(0, 1000);

		console.log(this);

		if (posts.length > 0 && posts[0].webtoonId)
			localStorage.setItem(
				posts[0].webtoonId,
				JSON.stringify({
					posts: this.posts,
					episodeNewest: Array.from(this.episodeNewest).map(
						([episode, newest]) => ({ episode, newest }),
					),
				}),
			);

		return posts;
	}

	static load(webtoonId?: `${number}`) {
		if (webtoonId) {
			const cache = localStorage.getItem(webtoonId);

			const episodeNewest = new Map<number, PostIdType>();
			const posts: Post[] = [];

			if (cache !== null) {
				const parsed = JSON.parse(cache);

				if ("posts" in parsed) {
					Array.prototype.forEach.call(parsed.posts, (post) =>
						posts.push(new Post(post)),
					);
				}

				if ("episodeNewest" in parsed) {
					Array.prototype.forEach.call(parsed.episodeNewest, (item) => {
						const { episode, newest } = item;
						episodeNewest.set(episode, newest);
					});
				}

				return new Cache(posts, episodeNewest);
			}

			return new Cache();
		}

		throw new Error("No `webtoonId` was passed in");
	}
}
