import { Post, PostIdType, PageIdType } from "@root/src/post";
import { faker } from "@faker-js/faker";

export function mockPostData(): Post {
  if (!faker) {
    return new Post();
  }
  const pageId = `c_109098_${faker.number.int({ min: 1, max: 200 })}`;
  const contentId = `GW-epicom:0-${pageId}-${faker.number
    .int({ min: 1, max: 1000 })
    .toString(36)}` as PostIdType;
  const likeCount = faker.number.int({ min: 0, max: 200 });
  const dislikeCount = faker.number.int({ min: 0, max: 200 });

  const username = faker.internet.userName();

  const createdDate = faker.date.past();

  return new Post({
    serviceTicketId: "epicom",
    pageId: pageId as PageIdType, // e.g. "w_1320_276"
    pageUrl: `_${pageId}` as `_${PageIdType}`, // e.g. "_w_1320_276"
    isOwner: false,
    isPinned: false,
    commentDepth: 1,
    depth: 1,
    creationType: "BY_USER", // e.g. "BY_USER" // TODO: Specify more?
    status: "SERVICE", // e.g. "SERVICE" // TODO: Specify more?
    body: faker.lorem.lines(),
    bodyFormat: {
      type: "PLAIN", // e.g. "PLAIN" // TODO: Specify more?
      version: "", // e.g. ""
    },
    settings: {
      reply: "ON", // Guessing the type here. Revisit if error
      reaction: "OFF",
      spoilerFilter: "OFF",
    },
    sectionGroup: {
      totalCount: 0,
      sections: [], // TODO: Specify type of the array?
    },
    reactions: [
      {
        reactionId: "post_like", // e.g. "post_like" // TODO: Specify more?
        contentId: contentId, // e.g. "GW-epicom:0-w_1320_276-ee"
        emotions: [
          {
            emotionId: "like", //e.g. "like" // TODO: Specify more?
            count: likeCount,
            reacted: likeCount > 0,
          },
          {
            emotionId: "dislike", //e.g. "like" // TODO: Specify more?
            count: dislikeCount,
            reacted: dislikeCount > 0,
          },
        ],
      },
    ],
    extraList: [], // TODO: Specify type of the array?
    createdBy: {
      publisherType: "PAGE", // e.g. "PAGE" // TODO: Specify more?
      id: username, // e.g. "wbi2v3"
      status: "SERVICe", // e.g. "SERVICE" // TODO: Specify more?
      cuid: crypto.randomUUID(), // e.g. "2f586b40-5a1c-11eb-9de0-246e96398d40"
      name: faker.internet.displayName(), // e.g. "Gr33nEclipse"
      profileUrl: `_${username}`, // e.g. "_wbi2v3"
      isCreator: faker.number.int() % 2 === 0, // Poster is a creator
      isPageOwner: false, // Poster is the creator of the series this post is in
      maskedUserId:
        username.length > 4
          ? username.substring(0, 4) + "*".repeat(username.length - 4)
          : username.substring(0, 1) + "*".repeat(username.length - 1), // e.g. "2f58****"
      encUserId: "", // e.g. ""
      profileImage: {}, // TODO: Specify more. Currently, not sure of the shape of this object
      extraList: [], // TODO: Specify type of the array?
      restriction: {
        isWritePostRestricted: false,
        isBlindPostRestricted: false,
      },
    },
    createdAt: createdDate.getTime(), // e.g. 1712368102285
    updatedAt: createdDate.getTime(), // e.g. 1712368102285
    childPostCount: faker.number.int({ min: 0, max: 200 }),
    activeChildPostCount: faker.number.int({ min: 0, max: 200 }),
    pageOwnerChildPostCount: faker.number.int({ min: 0, max: 200 }),
    activePageOwnerChildPostCount: faker.number.int({ min: 0, max: 200 }),
    id: contentId, // e.g. "GW-epicom:0-w_1320_276-ee"
    rootId: contentId, // e.g. "GW-epicom:0-w_1320_276-ee"
  });
}
