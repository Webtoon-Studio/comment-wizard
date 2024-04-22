import { PostIdType } from "./webtoon";

const STORAGE_SETTING_NAME = "cs-settings";
const STORAGE_SERIES_NAME = "cs-series-items";
const STORAGE_NEWEST_NAME = "cs-newest-posts";
const STORAGE_POSTS_NAME = "cs-all-posts";

const INCOM_ONMOUNTED_EVENT_NAME = "incomMounted";
const POSTS_FETCHED_EVENT_NAME = "postsFetched";

export interface SeriesItem {
  _type: "seriesItem"; // internal interface identity
  title: string;
  link: string;
  titleId: `${number}`;
  isCanvas?: boolean;
  newCount?: number;
}

export interface EpisodeNewestPost {
  _type: "episodeNewestPost";
  titleId: string;
  episode: number;
  newestPostId: PostIdType;
}

export function isPostIdNewer(
  value: PostIdType,
  compared: PostIdType
): boolean {
  // Return:
  //     - 'true': `postId` is newer
  //     - 'false': `postId` is not newer
  const valueId = parseInt(value.split("-")[3], 36);
  const comparedId = parseInt(compared.split("-")[3], 36);
  return valueId > comparedId;
}

export {
  STORAGE_SETTING_NAME,
  STORAGE_SERIES_NAME,
  STORAGE_NEWEST_NAME,
  STORAGE_POSTS_NAME,
  POSTS_FETCHED_EVENT_NAME,
  INCOM_ONMOUNTED_EVENT_NAME,
};
