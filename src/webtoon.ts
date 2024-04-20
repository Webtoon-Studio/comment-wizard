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

export type PageIdType = `${"w" | "c"}_${number}_${number}`;
export type PostIdType = `GW-epicom:${number}-${PageIdType}-${string}`;

export interface IPost {
  serviceTicketId: "epicom";
  pageId: PageIdType; // e.g. "w_1320_276"
  pageUrl: `_${PageIdType}`; // e.g. "_w_1320_276"
  isOwner: boolean;
  isPinned: boolean;
  commentDepth: number;
  depth: number;
  creationType: string; // e.g. "BY_USER" // TODO: Specify more?
  status: string; // e.g. "SERVICE" // TODO: Specify more?
  body: string;
  bodyFormat: {
    type: string; // e.g. "PLAIN" // TODO: Specify more?
    version: string; // e.g. ""
  };
  settings: {
    reply: "ON" | "OFF"; // Guessing the type here. Revisit if error
    reaction: "ON" | "OFF";
    spoilerFilter: "ON" | "OFF";
  };
  sectionGroup: {
    totalCount: number;
    sections: any[]; // TODO: Specify type of the array?
  };
  reactions: [
    {
      reactionId: string; // e.g. "post_like" // TODO: Specify more?
      contentId: PostIdType; // e.g. "GW-epicom:0-w_1320_276-ee"
      emotions: [
        {
          emotionId: string; //e.g. "like" // TODO: Specify more?
          count: number;
          reacted: boolean;
        }
      ];
    }
  ];
  extraList: any[]; // TODO: Specify type of the array?
  createdBy: {
    publisherType: string; // e.g. "PAGE" // TODO: Specify more?
    id: string; // e.g. "wbi2v3"
    status: string; // e.g. "SERVICE" // TODO: Specify more?
    cuid: string; // e.g. "2f586b40-5a1c-11eb-9de0-246e96398d40"
    name: string; // e.g. "Gr33nEclipse"
    profileUrl: string; // e.g. "_wbi2v3"
    isCreator: boolean; // Poster is a creator
    isPageOwner: boolean; // Poster is the creator of the series this post is in
    maskedUserId: string; // e.g. "2f58****"
    encUserId: string; // e.g. ""
    profileImage: object; // TODO: Specify more. Currently, not sure of the shape of this object
    extraList: any[]; // TODO: Specify type of the array?
    restriction: {
      isWritePostRestricted: boolean;
      isBlindPostRestricted: boolean;
    };
  };
  createdAt: number; // e.g. 1712368102285
  updatedAt: number; // e.g. 1712368102285
  childPostCount: number;
  activeChildPostCount: number;
  pageOwnerChildPostCount: number;
  activePageOwnerChildPostCount: number;
  id: PostIdType; // e.g. "GW-epicom:0-w_1320_276-ee"
  rootId: PostIdType; // e.g. "GW-epicom:0-w_1320_276-ee"
}

interface IPostSuccessResponse {
  status: "success";
  result: {
    posts: IPost[];
    pagination: {
      next?: PostIdType;
      prev?: PostIdType;
    };
    activeChildPostCount: number;
    childPostCount: number;
    isPageOwner: boolean;
  };
}

interface IPostFailResponse {
  status: "fail";
  error: {
    code: string;
    typeMessage: string;
  };
}

type PostResponse = IPostSuccessResponse | IPostFailResponse;

export class Webtoon {
  readonly url: string;

  type: "c" | "w";
  id: `${number}`; // webtoon title id

  // initialized as null first. Must call getEpisodesCount first!
  episodes: number | null;

  constructor(url: string) {
    this.url = url;

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

      this.id = matches[2] as `${number}`;
    } else {
      let msg = `Provided URL ${url} did not follow specification of https://webtoons.com/../(canvas|genre)/.../list?title_no=(NUMBER)`;
      throw new Error(msg);
    }

    this.episodes = null;
  }

  async getEpisodeCount() {
    const response = await fetch(this.url, {
      credentials: "include",
    });

    const html = await response.text();

    let container = document.createElement("div");
    container.innerHTML = html;

    const item = container.querySelector("li._episodeItem");

    if (item) {
      const episode = item.getAttribute("data-episode-no");
      if (episode) {
        this.episodes = parseInt(episode, 10);
      } else {
        throw new Error(
          `Failed to find "data-episode-no" from the item: ${item}`
        );
      }
    } else {
      throw new Error(`Failed to find episodes from page of ${this.url}`);
    }
  }

  async getPosts() {
    let posts = new Set<Post>();

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
        throw new Error("Failed to get posts from api: " + json.error);
      }

      json.result.posts.forEach((post) => posts.add(new Post(post)));

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
          json.result.posts.forEach((post) => posts.add(new Post(post)));

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
    let today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let posts = new Set<Post>();

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
        throw new Error("Failed to get posts from api: " + json.error);
      }

      let found = false;
      let added_at_least_first_post = false;

      for (let post of json.result.posts) {
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

        for (let post of json.result.posts) {
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
    prev_newest_map: Map<number, PostIdType>
  ): Promise<Post[]> {
    let posts: Post[] = [];

    let episode = 1;

    let did = { reach_end: false };

    while (true && !did.reach_end) {
      const prevNewestPost = prev_newest_map.get(episode);
      if (prevNewestPost) {
        let episode_posts = await this.getNewestPostsForEpisode(
          episode,
          prevNewestPost,
          did
        );
        episode_posts.forEach((post) => posts.push(post));

        episode += 1;
      } else {
        console.error(
          `Unable to get newst posts for episode ${episode}.\nThere is no such key in the prev newst map!`
        );
        break;
      }
    }

    return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  async getNewestPostsForEpisode(
    episode: number,
    prev_newest_post: PostIdType,
    did: { reach_end: boolean }
  ): Promise<Post[]> {
    if (!this.id || !this.type) {
      console.error(
        "Unable to get newst posts for episode: undefined id and/or type field(s)"
      );
      return [];
    }

    let posts: Post[] = [];

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

        posts.push(new Post(post));
      }

      next = json.result.pagination.next;
    }

    return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

async function webtoonFetch(url: string) {
  let session = getCurrentUserSession();

  if (session === null) {
    throw new Error("Failed to get current user session from cookie");
  }

  let headers = new Headers();
  headers.append("Service-Ticket-Id", "epicom");
  headers.append("Accept-Encoding", "gzip, deflate, br, zstd");
  headers.append("Cookie", session);

  return fetch(url, { headers: headers });
}

function postUrl(
  type: "c" | "w",
  webtoonId: `${number}`,
  episode: number,
  cursor?: PostIdType
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

export class Post {
  webtoonType?: "w" | "c";
  webtoonId?: `${number}`;
  episode?: number;
  id?: PostIdType;
  rootId?: PostIdType;
  isTop?: boolean;
  username?: string;
  userId?: string;
  userProfile?: string;
  isCreator?: boolean;
  isOwner?: boolean;
  createdAt?: number;
  replies?: number;
  likes?: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
  dislikes?: number;
  body?: string;

  constructor(raw?: IPost) {
    // For when manually constructing the object
    if (raw === undefined) {
      return;
    }

    const splits = raw.pageId.split("_");

    const webtoonType = splits[0];
    const webtoonId = splits[1];
    const episode = splits[2];

    // Type check
    if (
      (webtoonType !== "w" && webtoonType !== "c") ||
      !/^\d+$/.exec(webtoonId) ||
      !/^\d+$/.exec(episode)
    ) {
      throw new TypeError(
        `The pageId (${raw.pageId}) is not in the expected format: w_\${number}_\${number}`
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

    this.webtoonType = webtoonType;
    this.webtoonId = webtoonId as `${number}`;
    this.episode = parseInt(episode);
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

  async getReplies(): Promise<Post[]> {
    if (this.id === undefined) {
      console.warn(
        "Unable to get replies: undefined id field.\nDid you perhaps construct Post wrong?"
      );
      return [];
    }

    let errorLog: string[] = [];
    let replies = new Set<Post>();
    const url = replyUrl(this.id);

    const response = await webtoonFetch(url);
    const json = (await response.json()) as PostResponse;

    if (json.status === "success") {
      json.result.posts.forEach((reply) => replies.add(new Post(reply)));

      let next = json.result.pagination.next;

      while (next !== undefined) {
        const url = replyUrl(this.id, next);

        const response = await webtoonFetch(url);
        const json = (await response.json()) as PostResponse;

        if (json.status === "success") {
          json.result.posts.forEach((reply) => replies.add(new Post(reply)));

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

    return [...replies].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  async reply(message: string): Promise<Post[]> {
    if (
      this.webtoonType === undefined ||
      this.webtoonId === undefined ||
      this.episode === undefined
    ) {
      console.warn(
        "Unable to reply: undefined webtoonType, webtoonId, and/or episode field(s)"
      );
      return [];
    }

    const pageId = `${this.webtoonType}_${this.webtoonId}_${this.episode}`;

    const url = `https://www.webtoons.com/p/api/community/v2/post`;

    const apiToken = await getApiToken();
    if (apiToken === undefined) {
      throw new Error("Failed to get API Token");
    }

    const session = getCurrentUserSession();
    if (session === null) {
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
  async like(): Promise<{ likes: number; hasLiked: boolean } | null> {
    if (!this.id || !this.webtoonType || !this.webtoonId || !this.episode) {
      console.warn(
        "Unable to like: undefined webtoonType, webtoonId, and/or episode field(s)"
      );
      return null;
    }

    const pageId: PageIdType = `${this.webtoonType}_${this.webtoonId}_${this.episode}`;

    const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${this.id}/emotion/like`;

    const apiToken = await getApiToken();
    if (apiToken === undefined) {
      throw new Error("Failed to get API Token");
    }

    const session = getCurrentUserSession();
    if (session === null) {
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
      // Revert property change
      this.hasLiked = !this.hasLiked;

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
    if (!this.id || !this.webtoonType || !this.webtoonId || !this.episode) {
      console.error(
        "Unable to dislike: undefined id, webtoonType, webtoonId, and/or episode field(s)"
      );
      return;
    }
    const pageId = `${this.webtoonType}_${this.webtoonId}_${this.episode}`;

    const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${this.id}/emotion/dislike`;

    const apiToken = await getApiToken();
    if (apiToken === undefined) {
      throw new Error("Failed to get API Token");
    }

    const session = getCurrentUserSession();
    if (session === null) {
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

  static fromCached(obj: Post): Post {
    let post = new Post();

    post.webtoonType = obj.webtoonType;
    post.webtoonId = obj.webtoonId;
    post.userProfile = obj.userProfile;
    post.username = obj.username;
    post.userId = obj.userId;
    post.id = obj.id;
    post.rootId = obj.rootId;
    post.isCreator = obj.isCreator;
    post.isOwner = obj.isOwner;
    post.isTop = obj.isTop;
    post.replies = obj.replies;
    post.likes = obj.likes;
    post.dislikes = obj.dislikes;
    post.hasLiked = obj.hasLiked;
    post.hasDisliked = obj.hasDisliked;
    post.body = obj.body;
    post.episode = obj.episode;
    post.createdAt = obj.createdAt;

    return post;
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
  webtoonType: "w" | "c",
  webtoonId: `${number}`,
  episode: number,
  apiToken: string
) {
  const pageId: PageIdType = `${webtoonType}_${webtoonId}_${episode}`;

  const url = `https://www.webtoons.com/p/api/community/v2/reaction/post_like/channel/${pageId}/content/${postId}/emotion/count`;

  const session = getCurrentUserSession();

  if (session === null) {
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

async function getApiToken(): Promise<string | undefined> {
  const url = "https://www.webtoons.com/p/api/community/v1/api-token";

  let session = getCurrentUserSession();

  if (session === null) {
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

  type ApiTokenResponse = {
    status: string;
    result?: {
      token: string;
    };
    error?: {
      code: string;
      typeMessage: string;
    };
  };

  const json = (await response.json()) as ApiTokenResponse;

  if (json.status !== "success" || !json.result) {
    throw new Error(`Fetch to /api-token failed: ${json.error?.typeMessage}`);
  }

  return json.result.token;
}

function getCurrentUserSession(): string | null {
  var cookie = document.cookie;
  var cookies = cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookieItem = cookies[i].trim();
    if (cookieItem.startsWith("NEO_SES=")) {
      return cookieItem.substring("NEO_SES=".length, cookieItem.length);
    }
  }
  return null;
}
