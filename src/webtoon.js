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

// Closure to ensure that only `fromUrl` can be used to instantiate a `Webtoon`.
const Webtoon = (() => {
  class Webtoon {
    constructor(url) {
      let regex = RegExp(
        "https:\\/\\/www.webtoons.com\\/\\w\\w\\/(\\w+)\\/.+\\/list\\?title_no=(\\d+)"
      );

      const matches = url.match(regex);

      if (matches && matches.length !== 2) {
        if (matches[1] === "canvas") {
          this.type = "c";
        } else {
          this.type = "w";
        }

        this.id = matches[2];
      } else {
        let msg = `Provided URL ${url} did not follow specification of https://webtoons.com/../(canvas|genre)/.../list?title_no=(NUMBER)`;
        throw new Error(msg);
      }

      this.episodes = 0;
    }

    async getPosts() {
      let posts = new Set();

      let episode = 1;

      while (true) {
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
          throw new Error("Failed to get posts from api: " + json.error);
        }

        json.result.posts.forEach((post) => posts.add(new Post(post)));

        let next = json.result.pagination.next;

        while (next !== undefined) {
          const url = postUrl(this.type, this.id, episode, next);

          const response = await webtoonFetch(url);
          const json = await response.json();

          json.result.posts.forEach((post) => posts.add(new Post(post)));

          next = json.result.pagination.next;
        }

        episode += 1;
      }

      return [...posts].sort((a, b) => b.createdAt - a.createdAt);
    }

    async getNewestPostsForEpisode(episode, prev_newest_post = "") {
      let posts = [];

      const url = postUrl(this.type, this.id, episode);

      const response = await webtoonFetch(url);

      // NOTE: If an episode doesnt exist, then it will return a 404.
      // This signifies that all available episodes have been gone through.
      if (response.status === 404) {
        return posts;
      }

      const json = await response.json();

      if (json.status === "fail") {
        console.log(json);
        throw new Error("Failed to get posts from api: " + json.error);
      }

      let found = false;

      for (let post of json.result.posts) {
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

        for (let post of json.result.posts) {
          if (post.id === prev_newest_post) {
            break;
          }

          posts.add(new Post(post));
        }

        next = json.result.pagination.next;
      }

      return posts.sort((a, b) => b.createdAt - a.createdAt);
    }

    async getNewestsPosts(prev_newest_map) {
      let posts = [];

      let episode = 1;

      let did = { reach_end: false };

      while (true && !did.reach_end) {
        let episode_posts = await this.getNewestPostsForEpisode(
          episode,
          prev_newest_map.push(episode)
        );

        episode_posts.forEach((post) => posts.add(post));

        episode += 1;
      }

      return posts.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

  return {
    fromUrl: async function (url) {
      let webtoon = new Webtoon(url);

      webtoon.episodes = await getEpisodeCount(url);

      return webtoon;
    },
  };
})();

async function getEpisodeCount(url) {
  const response = await fetch(url);
  const html = await response.text();

  let container = document.createElement("div");
  container.innerHTML = html;

  const item = container.querySelector("li._episodeItem");

  if (item) {
    const episode = item.getAttribute("data-episode-no");
    return parseInt(episode, 10);
  }

  throw new Error(`Failed to find episodes from page of ${url}`);
}

async function webtoonFetch(url) {
  let session = getCurrentUserSession();

  let headers = new Headers();
  headers.append("Service-Ticket-Id", "epicom");
  headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
  headers.append("Cookie", session);

  return fetch(url, { headers: headers });
}

function postUrl(type, webtoon, episode, cursor = "") {
  let pageId = `${type}_${webtoon}_${episode}`;

  return `https://www.webtoons.com/p/api/community/v2/posts?pageId=${pageId}&pinRepresentation=none&prevSize=0&nextSize=100&cursor=${cursor}&withCusor=true`;
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
class Post {
  constructor(raw) {
    const splits = raw.pageId.split("_");

    const webtoonType = splits[0];
    const webtoonId = splits[1];
    const episode = splits[2];

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

    this.webtoonType = webtoonType;
    this.webtoonId = webtoonId;
    this.episode = episode;
    this.id = raw.id;
    this.rootId = raw.rootId;
    this.isTop = raw.isPinned;
    this.username = raw.createdBy.name;
    this.userId = raw.createdBy.cuid;
    this.userProfile = raw.createdBy.profileUrl;
    this.isCreator = raw.createdBy.isCreator;
    this.isOwner = raw.createdBy.isPageOwner;
    this.createdAt = raw.createdAt;
    this.replies = raw.childPostCount;
    this.likes = likes;
    this.hasLiked = hasLiked;
    this.hasDisliked = hasDisliked;
    this.dislikes = dislikes;
    this.body = raw.body;
  }

  async getReplies() {
    let replies = new Set();

    const url = replyUrl(this.id);

    const response = await webtoonFetch(url);
    const json = await response.json();

    json.result.posts.forEach((reply) => replies.add(new Post(reply)));

    let next = json.result.pagination.next;

    while (next !== undefined) {
      const url = replyUrl(type, next);

      const response = await webtoonFetch(url);
      const json = await response.json();

      json.result.posts.forEach((reply) => replies.add(new Post(reply)));

      next = json.result.pagination.next;
    }

    return [...replies].sort((a, b) => b.createdAt - a.createdAt);
  }

  async reply(message) {
    const pageId = `${this.webtoonType}_${this.webtoonId}_${this.episode}`;

    const url = `https://www.webtoons.com/p/api/community/v2/post`;

    const apiToken = await getApiToken();
    if (apiToken === undefined) {
      throw new Error("Failed to get API Token");
    }

    const session = getCurrentUserSession();
    if (session === undefined) {
      throw new Error("Failed to get current user session from cookie");
    }

    let headers = new Headers();
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
  async like() {
    const pageId = `${this.type}_${this.webtoon_id}_${this.episode}`;

    const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${this.id}/emotion/like`;

    const apiToken = await getApiToken();
    if (apiToken === undefined) {
      throw new Error("Failed to get API Token");
    }

    const session = getCurrentUserSession();
    if (session === undefined) {
      throw new Error("Failed to get current user session from cookie");
    }

    let headers = new Headers();
    headers.append("Service-Ticket-Id", "epicom");
    headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
    headers.append("Cookie", session);
    headers.append("Api-Token", apiToken);

    let response;

    if (this.hasLiked) {
      // If has already liked a post, then unlike it.
      response = await fetch(url, { method: "DELETE", headers: headers });
      this.hasLiked = false;
    } else {
      response = await fetch(url, { method: "PUT", headers: headers });
      this.hasLiked = true;
    }

    if (!response.ok) {
      console.log(await response.json());
      throw new Error("Failed to like or unlike post");
    }

    const countInfo = await getCountInfo(
      this.id,
      this.webtoonType,
      this.webtoonId,
      this.episode,
      apiToken
    );

    return {
      likes: countInfo.likes,
      hasLiked: countInfo.hasLiked,
    };
  }

  // NOTE: If you have already disliked a post, then you cannot like it until you have undisliked the post.
  async dislike() {
    const pageId = `${this.type}_${this.webtoon_id}_${this.episode}`;

    const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${this.id}/emotion/dislike`;

    const apiToken = await getApiToken();
    if (apiToken === undefined) {
      throw new Error("Failed to get API Token");
    }

    const session = getCurrentUserSession();
    if (session === undefined) {
      throw new Error("Failed to get current user session from cookie");
    }

    let headers = new Headers();
    headers.append("Service-Ticket-Id", "epicom");
    headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
    headers.append("Cookie", session);
    headers.append("Api-Token", apiToken);

    let response;

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
      this.webtoonType,
      this.webtoonId,
      this.episode,
      apiToken
    );

    return {
      dislikes: countInfo.dislikes,
      hasDisliked: countInfo.hasDisliked,
    };
  }

  async delete() {
    // https://www.webtoons.com/p/api/community/v2/post/GW-epicom:0-c_843910_2-3-4
    // DELETE http method
    throw new Error("todo");
  }

  async report() {
    throw new Error("todo");
  }

  async block() {
    throw new Error("todo");
  }
}

// `cursor` is only provided beyond the first use of function.
function replyUrl(id, cursor = "") {
  return `https://www.webtoons.com/p/api/community/v2/post/${id}/child-posts?sort=newest&prevSize=0&nextSize=100&withCursor=true&cursor=${cursor}`;
}

async function getCountInfo(post, webtoonType, webtoonId, episode, apiToken) {
  const pageId = `${webtoonType}_${webtoonId}_${episode}`;

  const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${post}/emotion/count`;

  const session = getCurrentUserSession();

  if (session === undefined) {
    throw new Error("Failed to get current user session from cookie");
  }

  let headers = new Headers();
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

async function getApiToken() {
  const url = "https://www.webtoons.com/p/api/community/v1/api-token";

  let session = getCurrentUserSession();

  if (session === undefined) {
    throw new Error("Failed to get current user session from cookie");
  }

  let headers = new Headers();
  headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
  headers.append("Cookie", session);

  const response = await fetch(url, { headers: headers });

  // NOTE: Example:
  // {
  // 	"status": "success",
  // 	"result": {
  // 		"token": "1:59391548-5153-79b1-b880-878c20cceba2:u"
  // 	}
  // }
  const json = await response.json();

  if (json.status !== "success") {
    throw new Error(`Fetch to /api-token failed: ${json.error.typeMessage}`);
  }

  return json.result.token;
}

function getCurrentUserSession() {
  var cookies = document.cookie;
  var cookies = cookies.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookies = cookies[i].trim();
    if (cookies.startsWith("NEO_SES=")) {
      return cookies.substring("NEO_SES=".length, cookies.length);
    }
  }
}

module.exports = Webtoon;
