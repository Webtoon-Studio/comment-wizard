const { Post } = require("../src/webtoon");
const { Cache } = require("../src/cache"); // Must load after Post
const crypto = require("crypto");

/**
 * @jest-environment jsdom
 */
test("Should stringify and parse correctly", () => {
  let post = new Post();

  post.webtoonType = "w";
  post.webtoonId = "95";
  post.userProfile = "siu";
  post.username = "S.I.U";
  post.userId = crypto.randomUUID();
  post.id = "GW-epicom:0-w_95_1-1d";
  post.rootId = "GW-epicom:0-w_95_1-1d";
  post.isCreator = false;
  post.isOwner = false;
  post.isTop = false;
  post.replies = 122;
  post.likes = 67759;
  post.dislikes = 313;
  post.hasLiked = false;
  post.hasDisliked = false;
  post.body = "Should Store";
  post.episode = 1;
  post.createdAt = 1415320924421;

  const stringified = JSON.stringify(post);
  const expectedString = JSON.stringify({
    webtoonType: "w",
    webtoonId: "95",
    userProfile: "siu",
    username: "S.I.U",
    userId: post.userId,
    id: "GW-epicom:0-w_95_1-1d",
    rootId: "GW-epicom:0-w_95_1-1d",
    isCreator: false,
    isOwner: false,
    isTop: false,
    replies: 122,
    likes: 67759,
    dislikes: 313,
    hasLiked: false,
    hasDisliked: false,
    body: "Should Store",
    episode: 1,
    createdAt: 1415320924421,
  });

  expect(stringified).toEqual(expectedString);

  const parsed = JSON.parse(stringified);
  const postClone = Post.fromCached(parsed);

  expect(postClone).toEqual(post);
});

test("Should create empty default instance", () => {
  let cache = new Cache();

  expect(cache.episodeNewest).toStrictEqual(new Map());
  expect(cache.posts).toStrictEqual([]);
});

test("Should create empty Cache instance from load", () => {
  let cache = Cache.load("95");

  expect(cache.episodeNewest).toStrictEqual(new Map());
  expect(cache.posts).toStrictEqual([]);
});

test("Should store to localStorage and return updated object", () => {
  let cache = new Cache();
  let post = new Post();

  post.webtoonType = "w";
  post.webtoonId = "95";
  post.userProfile = "siu";
  post.username = "S.I.U";
  post.userId = crypto.randomUUID();
  post.id = "GW-epicom:0-w_95_1-1d";
  post.rootId = "GW-epicom:0-w_95_1-1d";
  post.isCreator = false;
  post.isOwner = false;
  post.isTop - false;
  post.replies = 122;
  post.likes = 67759;
  post.dislikes = 313;
  post.hasLiked = false;
  post.hasDisliked = false;
  post.body = "Should Store";
  post.episode = 1;
  post.createdAt = 1415320924421;

  let returned = cache.store([post]);

  let expected = new Map();
  expected.set(1, "GW-epicom:0-w_95_1-1d");

  // This always fails. `Cache.store` only returns posts
  expect(returned.episodeNewest).toStrictEqual(expected);
  expect(returned.posts).toStrictEqual([post]);

  console.log(localStorage);
});

test("Should store to localStorage and return updated object", () => {
  let cache = new Cache();
  let post = new Post();

  post.webtoonType = "w";
  post.webtoonId = "95";
  post.userProfile = "siu";
  post.username = "S.I.U";
  post.userId = crypto.randomUUID();
  post.id = "GW-epicom:0-w_95_1-1d";
  post.rootId = "GW-epicom:0-w_95_1-1d";
  post.isCreator = false;
  post.isOwner = false;
  post.isTop - false;
  post.replies = 122;
  post.likes = 67759;
  post.dislikes = 313;
  post.hasLiked = false;
  post.hasDisliked = false;
  post.body = "Should Store";
  post.episode = 1;
  post.createdAt = 1415320924421;

  cache.store([post]);

  let expected = new Map();
  expected.set(1, "GW-epicom:0-w_95_1-1d");

  let returned = Cache.load("95");
  expect(returned.posts).toEqual([post]);
  expect(returned.episodeNewest).toEqual(expected);
});
