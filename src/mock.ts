import { faker } from "@faker-js/faker";
import type { EpisodeItem, SeriesItem } from "@shared/global";
import { type IWebtoonPost, type PageIdType, Post, type PostIdType } from "@shared/post";
import {Title} from "@shared/title";

export function mockTitles(): Title {
	if (!faker) {
		return new Title({
			author: [{
				nickname: "mock_author"
			}],
			extra: {
				episodeListPath: "some/path/to/titleId",
				restTerminationStatus: "SERIES",
				unsuitableForChildren: false
			},
			genres: ["DRAMA"],
			grade: "CHALLENGE",
			id: "0",
			recentEpisodeRegisteredAt: 0,
			representGenre: "DRAMA",
			shareThumbnailUrl: "",
			subject: "Mock Title",
			thumbnailUrl: "",
			titleRegisteredAt: 0
		});
	}

	const nickname = faker.internet.displayName();
	const title = faker.music.songName();
	const link = "";
	const titleId = faker.string.numeric({
		length: {min: 5, max: 6}, 
		allowLeadingZeros: false
	});
	const isCanvas = true;
	const newCount = faker.number.int({min: 0, max: 200});
	const registerDate = faker.date.past({ years: 10 });
	const recentDate = faker.date.recent({ days: 10 });

	return new Title({
		author: [{
			nickname
		}],
		extra: {
			episodeListPath: "some/path/to/titleId",
			restTerminationStatus: "SERIES",
			unsuitableForChildren: false
		},
		genres: ["DRAMA"],
		grade: "CHALLENGE",
		id: titleId,
		recentEpisodeRegisteredAt: recentDate.getTime(),
		representGenre: "DRAMA",
		shareThumbnailUrl: "",
		subject: title,
		thumbnailUrl: "",
		titleRegisteredAt: registerDate.getTime()
	})
}

export function mockEnd(page: number): boolean {
	if (!faker) {
		return page >= 5 + Math.ceil(Math.random() * 20);
	}
	return page >= faker.number.int({min: 5, max: 30});
}

export function mockEpisodeItems(titleId: `${number}`, page: number): EpisodeItem[] {
	const numberItems = 10;

	if (!faker) {
		return Array.from(new Array(numberItems)).map((_, i) => ({
			_type: "episodeItem",
			seriesId: titleId,
			index: ((page-1) * numberItems) + i + 1,
			thumb: "",
			title: "Mock Test Episode Title",
			date: new Date(new Date(2020-page, 0, 1).getTime() - ((numberItems - i) * 1000 * 60 * 60 * 24 * Math.ceil(7 + (Math.random() * 7)))).getTime()
		} satisfies EpisodeItem));
	}


	const startDate = faker.date.past({ years: page+1, refDate: new Date()});

	return Array.from(new Array(numberItems)).map((_, i) => {
		const title = faker.music.songName();
		const thumb = faker.image.avatar();
		const endDate = startDate.setDate(startDate.getDate() + faker.number.int({min: 7, max: 14}));
		const date = faker.date.between({ from: startDate, to: endDate}).getTime();
		return {
			_type: "episodeItem",
			seriesId: titleId,
			index: ((page - 1) * numberItems) + i + 1,
			thumb,
			title,
			date
		} satisfies EpisodeItem;
	})
}


export function mockPostData(parentId?: PostIdType): IWebtoonPost {
	if (!faker) {
		const likeCount = 500 - Math.floor(Math.random() * 1000);
		return {
			serviceTicketId: "epicom",
			pageId: "w_1320_276" as PageIdType, // e.g. "w_1320_276"
			pageUrl: "_w_1320_276" as `_${PageIdType}`, // e.g. "_w_1320_276"
			isOwner: false,
			isPinned: false,
			commentDepth: 1,
			depth: 1,
			creationType: "BY_USER", // e.g. "BY_USER" // TODO: Specify more?
			status: "SERVICE", // e.g. "SERVICE" // TODO: Specify more?
			body: "This is a test message",
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
					contentId: "GW-epicom:0-w_1320_276-ee", // e.g. "GW-epicom:0-w_1320_276-ee"
					emotions: [
						{
							emotionId: "like", //e.g. "like" // TODO: Specify more?
							count: Math.max(0, likeCount),
							reacted: likeCount > 0,
						},
						{
							emotionId: "dislike", //e.g. "like" // TODO: Specify more?
							count: Math.min(0, likeCount),
							reacted: likeCount < 0,
						},
					],
				},
			],
			extraList: [], // TODO: Specify type of the array?
			createdBy: {
				publisherType: "PAGE", // e.g. "PAGE" // TODO: Specify more?
				id: "mock_username", // e.g. "wbi2v3"
				status: "SERVICe", // e.g. "SERVICE" // TODO: Specify more?
				cuid: crypto.randomUUID(), // e.g. "2f586b40-5a1c-11eb-9de0-246e96398d40"
				name: "MockUserName", // e.g. "Gr33nEclipse"
				profileUrl: `_mock_username`, // e.g. "_wbi2v3"
				isCreator: Math.random() > 0.5, // Poster is a creator
				isPageOwner: false, // Poster is the creator of the series this post is in
				maskedUserId: "mock*********", // e.g. "2f58****"
				encUserId: "", // e.g. ""
				profileImage: {}, // TODO: Specify more. Currently, not sure of the shape of this object
				extraList: [], // TODO: Specify type of the array?
				restriction: {
					isWritePostRestricted: false,
					isBlindPostRestricted: false,
				},
			},
			createdAt: new Date().getTime(), // e.g. 1712368102285
			updatedAt: new Date().getTime(), // e.g. 1712368102285
			childPostCount: Math.floor(Math.random() * 10),
			activeChildPostCount: Math.floor(Math.random() * 10),
			pageOwnerChildPostCount: Math.floor(Math.random() * 10),
			activePageOwnerChildPostCount: Math.floor(Math.random() * 10),
			id: "GW-epicom:0-w_1320_276-ee", // e.g. "GW-epicom:0-w_1320_276-ee"
			rootId: "GW-epicom:0-w_1320_276-ee", // e.g. "GW-epicom:0-w_1320_276-ee"
		} satisfies IWebtoonPost;
	}
	const pageId = `c_109098_${faker.number.int({ min: 1, max: 200 })}`;
	const contentId = `GW-epicom:0-${pageId}-${faker.number
		.int({ min: 1, max: 1000 })
		.toString(36)}` as PostIdType;
	const rootId = parentId ?? contentId;
	const likeCount = faker.number.int({ min: 0, max: 200 });
	const dislikeCount = faker.number.int({ min: 0, max: 200 });

	const username = faker.internet.userName();

	const createdDate = faker.date.past();
	const modifiedDate = faker.number.int() % 10 === 0 ? faker.date.between({from: createdDate, to:new Date()}) : createdDate;

	const replyCount = parentId || faker.number.int({min: 0, max: 10}) < 7 ? 0 : faker.number.int({ min: 0, max: 40 });

	return {
		serviceTicketId: "epicom",
		pageId: pageId as PageIdType, // e.g. "w_1320_276"
		pageUrl: `_${pageId}` as `_${PageIdType}`, // e.g. "_w_1320_276"
		isOwner: false,
		isPinned: false,
		commentDepth: 1,
		depth: 1,
		creationType: "BY_USER", // e.g. "BY_USER" // TODO: Specify more?
		status: faker.number.int() % 10 === 0 ? "DELETE" : "SERVICE", // e.g. "SERVICE" // TODO: Specify more?
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
			status: "SERVICE", // e.g. "SERVICE" // TODO: Specify more?
			cuid: crypto.randomUUID(), // e.g. "2f586b40-5a1c-11eb-9de0-246e96398d40"
			name: faker.internet.displayName(), // e.g. "Gr33nEclipse"
			profileUrl: `_${username}`, // e.g. "_wbi2v3"
			isCreator: faker.number.int() % 6 === 0, // Poster is a creator
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
		updatedAt: modifiedDate.getTime(), // e.g. 1712368102285
		childPostCount: replyCount,
		activeChildPostCount: faker.number.int({ min: 0, max: 200 }),
		pageOwnerChildPostCount: faker.number.int({ min: 0, max: 200 }),
		activePageOwnerChildPostCount: faker.number.int({ min: 0, max: 200 }),
		id: contentId, // e.g. "GW-epicom:0-w_1320_276-ee"
		rootId: rootId, // e.g. "GW-epicom:0-w_1320_276-ee"
	} satisfies IWebtoonPost;
}
