const { Post } = require("../src/webtoon");

class Cache {
  // If there is no posts then start empty.
  // If there is no episodeNewest, then it should be a fresh install
  // and we default to no data in cache.
  constructor(posts = [], episodeNewest = new Map()) {
    this.posts = posts;
    this.episodeNewest = episodeNewest;
  }

  // WARN: Must be sorted where newest is index 0 before being passed in.
  store(posts) {
    if (posts.length === 0) {
      return posts;
    }

    for (const post of posts) {
      // As the array must be stored prior to passing in
      // we can just take the first entry
      if (
        !this.episodeNewest.has(post.episode) ||
        post.createdAt > this.episodeNewest.get(this.episode).createdAt
      ) {
        this.episodeNewest.set(post.episode, post.id);
      }
    }

    // Store only the thousand most newest.
    this.posts = posts.slice(0, 1000);

    console.log(this);

    localStorage.setItem(
      posts[0].webtoonId,
      JSON.stringify({
        posts: this.posts,
        episodeNewest: Array.from(this.episodeNewest).map(
          ([episode, newest]) => ({ episode, newest })
        ),
      })
    );

    return posts;
  }

  static load(webtoonId) {
    if (webtoonId) {
      const cache = localStorage.getItem(webtoonId);

      let episodeNewest = new Map();
      let posts = [];

      if (cache !== null) {
        JSON.parse(cache, (key, value) => {
          if (key === "posts") {
            value.forEach((post) => posts.push(Post.fromCached(post)));
          } else if (key === "episodeNewest") {
            console.log(value);
            for (const { episode, newest } in value) {
              episodeNewest.set(episode, newest);
            }
          }
        });

        return new Cache(posts, episodeNewest);
      }

      return new Cache();
    }

    throw new Error("No `webtoonId` was passed in");
  }
}

module.exports = Cache;
