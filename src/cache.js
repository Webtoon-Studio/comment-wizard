class Cache {
  constructor(posts) {
    this.posts = posts.slice(0, 25);
    this.episode_newest = {};

    // for (const post of posts) {
    //   this.episode_newest.
    // }
  }

  store(posts) {
    // TODO
    // return what was just stored
  }

  static load() {
    return new Cache();
  }
}

module.exports = Cache;
