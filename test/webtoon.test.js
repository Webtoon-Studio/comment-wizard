const Webtoon = require("../src/webtoon");

/**
 * @jest-environment jsdom
 */

test("`Webtoon` should be instantiated with `Lore Olympus`", async () => {
  const webtoon = await Webtoon.fromUrl(
    "https://www.webtoons.com/en/romance/lore-olympus/list?title_no=1320"
  );

  expect(webtoon.id).toBe("1320");
  expect(webtoon.type).toBe("w");
  expect(webtoon.episodes).not.toBe(0);
});

test("`Webtoon` should be instantiated with `The Little Trashmaid`", async () => {
  const webtoon = await Webtoon.fromUrl(
    "https://www.webtoons.com/en/canvas/the-little-trashmaid/list?title_no=300138"
  );

  expect(webtoon.id).toBe("300138");
  expect(webtoon.type).toBe("c");
  expect(webtoon.episodes).not.toBe(0);
});

test(
  "Episode 1 of `Testing Service` should have a first comment of `First` ",
  async () => {
    const webtoon = await Webtoon.fromUrl(
      "https://www.webtoons.com/en/canvas/testing-service/list?title_no=843910"
    );

    const posts = await webtoon.getPosts();

    await new Promise((r) => setTimeout(r, 2000));

    // Posts come out sorted from most recent to latest, this reverses that order.
    posts.sort((a, b) => a.createdAt - b.createdAt);

    expect(posts[0].body).toBe("First");
    expect(posts[0].username).toBe("RoloEdits");
    expect(posts[0].id).toBe("GW-epicom:0-c_843910_1-1");
    expect(posts[0].isCreator).toBe(true);
    expect(posts[0].isOwner).toBe(true);
    expect(posts[0].userProfile).toBe("_nb3nw");
    expect(posts[0].userId).toBe("c3dc3830-a4c7-11ed-805e-a0086f45fdce");
    expect(posts[0].replies).toBe(2);
    expect(posts[0].likes).toBe(0);
    expect(posts[0].dislikes).toBe(0);
  },
  // milliseconds
  60 * 1000
);

test(
  "Episode 2 of `Testing Service` should have a first comment of `Placeholder? I hardly know her` ",
  async () => {
    const webtoon = await Webtoon.fromUrl(
      "https://www.webtoons.com/en/canvas/testing-service/list?title_no=843910"
    );

    const posts = await webtoon.getNewestPostsForEpisode(2);

    await new Promise((r) => setTimeout(r, 2000));

    // Posts come out sorted from most recent to latest, this reverses that order.
    posts.sort((a, b) => a.createdAt - b.createdAt);

    expect(posts[0].body).toBe("Placeholder? I hardly know her");
    expect(posts[0].username).toBe("Nen19");
    expect(posts[0].id).toBe("GW-epicom:0-c_843910_2-1");
    expect(posts[0].isCreator).toBe(true);
    expect(posts[0].isOwner).toBe(false);
    expect(posts[0].userProfile).toBe("p7kaa");
    expect(posts[0].userId).toBe("513630f0-a3cc-11e5-9630-000000007ff1");
    expect(posts[0].replies).toBe(1);
    expect(posts[0].likes).toBe(1);
    expect(posts[0].dislikes).toBe(1);
  },
  // milliseconds
  60 * 1000
);

test(
  "First comment of Episode 1 for `Testing Service` should have a first reply of `edited again` ",
  async () => {
    const webtoon = await Webtoon.fromUrl(
      "https://www.webtoons.com/en/canvas/testing-service/list?title_no=843910"
    );

    const posts = await webtoon.getNewestPostsForEpisode(1);

    await new Promise((r) => setTimeout(r, 1000));

    // Posts come out sorted from most recent to latest, this reverses that order.
    posts.sort((a, b) => a.createdAt - b.createdAt);

    const replies = await posts[0].getReplies();

    expect((replies.length = 2));
    expect(replies[1].body).toBe("edited again");
    expect(replies[1].username).toBe("RoloEdits");
    expect(replies[1].likes).toBe(0);
    expect(replies[1].dislikes).toBe(0);
  },
  // milliseconds
  60 * 1000
);

test(
  "Should get posts `g` and later for episode one of `Testing Service`",
  async () => {
    const webtoon = await Webtoon.fromUrl(
      "https://www.webtoons.com/en/canvas/testing-service/list?title_no=843910"
    );

    const posts = await webtoon.getNewestPostsForEpisode(
      1,
      "GW-epicom:0-c_843910_1-g"
    );

    await new Promise((r) => setTimeout(r, 2000));

    expect((posts.length = 5));
    expect(posts[0].body).toBe("jtdfuyjserhykfuykherthj");
    expect(posts[0].username).toBe("RoloEdits");

    expect(posts[3].body).toBe("aeryhtgsyeruyhrtfsyhu");
    expect(posts[3].username).toBe("RoloEdits");
  },
  // milliseconds
  60 * 1000
);
