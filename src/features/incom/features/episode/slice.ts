import { createAppSlice } from "@incom/common/hook";
import type { RootState } from "@incom/common/store";
import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { IS_DEV, type EpisodeItem } from "@shared/global";
import { mockEnd, mockEpisodeItems, mockTitles } from "@src/mock";

type FetchResult = { items: EpisodeItem[], newPagination: SeriesPaginationType };

const fetchEpisodesFromPage = async (link: string, titleId: `${number}`, page: number): Promise<FetchResult>  => {
    const episodeItems: EpisodeItem[] = [];
    const subfix = page > 1 ? `&&page=${page}` : "";
    const url = link + subfix;

    let resp = await fetch(url);

    if (resp.redirected) {
        const redirectedUrl = resp.url;
        resp = await fetch(
            redirectedUrl + subfix
        );
    }

    const html = await resp.text();
    const dom = new DOMParser();
    const doc = dom.parseFromString(html, "text/html");

    // check if done
    const pag = doc.querySelector("div.paginate > a[aria-current=true] > span");
    const realPage = pag && pag.textContent ? parseInt(pag.textContent) : null;
    if (pag === null || realPage === null || realPage !== page) {
        return {
            items: [],
            newPagination: {
                titleId,
                page: realPage || page - 1,
                isEnd: true
            }
        }
    }

    const queriedItems = doc.querySelectorAll<HTMLLIElement>("li._episodeItem");
    for (const item of queriedItems) {
        const index = item.getAttribute("data-episode-no");
        const thumb = item.querySelector<HTMLImageElement>("span.thmb > img")?.src || null;
        const title = item.querySelector<HTMLSpanElement>("span.subj > span")?.textContent || null;
        const date = item.querySelector<HTMLSpanElement>("span.date")?.textContent || null;

        if (index && thumb && title && date) {
            const newItem = {
                _type: "episodeItem",
                seriesId: titleId,
                index: parseInt(index),
                thumb: thumb.replace("webtoon-phinf", "swebtoon-phinf"),
                title,
                date: new Date(date).getTime()
            } satisfies EpisodeItem;
            console.log("New episode item parsed:", newItem);
            episodeItems.push(newItem);
        }
    }

    return {
        items: episodeItems,
        newPagination: {
            titleId,
            page,
            isEnd: false
        }
    };
}

export const getPageEpisodes = createAsyncThunk<
    FetchResult,
    `${number}`,
    {
        state: RootState,
        rejectedMeta: {
            message: string
        }
    }
>(
    "episode/getPageEpisodes",
    async (titleId, thunkAPI) => {
        const { episode: { paginations: pagination }, title: { items: titleItems } } = thunkAPI.getState() as RootState;
        const page = (pagination.find(p => p.titleId === titleId)?.page || 0) + 1; // incremented
        
        const targetTitle = titleItems.find(t => t.id === titleId);
        const link = targetTitle ? "https://www.webtoons.com/" + targetTitle.extra.episodeListPath :`https://www.webtoons.com/en/canvas/_/list?title_no=${titleId}`;

        if (IS_DEV) {
            const items = mockEpisodeItems(titleId, page);
            const end = mockEnd(page);
            return {
                items,
                newPagination: {
                    titleId,
                    page,
                    isEnd: end
                }
            };
        }

        const result = await fetchEpisodesFromPage(link, titleId, page);
        return result;
    },
    {
        condition: (titleId, { getState }) => {
            const { episode: {status, paginations: pages} } = getState() as RootState;
            if (status === 'loading') {
                return false;
            }
            if (pages.find(p => p.titleId === titleId)?.isEnd === true) {
                return false;
            }
        }
    }
);

export const getAllEpisodes = createAsyncThunk<
    FetchResult,
    `${number}`,
    {
        state: RootState,
        rejectedMeta: {
            message: string
        }
    }
>(
    "episode/getAllEpisodes",
    async (titleId, thunkAPI) => {
        const { episode: { paginations: pagination }, title: { items: titleItems } } = thunkAPI.getState() as RootState;
        let page = (pagination.find(p => p.titleId === titleId)?.page || 0); 
        
        const targetTitle = titleItems.find(t => t.id === titleId);
        const link = targetTitle ? "https://www.webtoons.com/" + targetTitle.extra.episodeListPath :`https://www.webtoons.com/en/canvas/_/list?title_no=${titleId}`;
        
        const episodeItems: EpisodeItem[] = [];
        let isEnd = false;

        const maxWaitMinutes = 5;
        const startTime = new Date().getTime();
        let currTime;

        while (isEnd === false) {
            page += 1; // incremented
            currTime = new Date().getTime();

            if (IS_DEV) {
                const items = mockEpisodeItems(titleId, page);
                await new Promise(resolve => setTimeout(resolve, 300));

                episodeItems.push(...items);                
                isEnd = mockEnd(page);
            } else {
                const result = await fetchEpisodesFromPage(link, titleId, page);

                episodeItems.push(...result.items);
                isEnd = result.newPagination.isEnd;
            }
            
            // Check if it's taking too long
            if (currTime - startTime > (maxWaitMinutes * 60 * 1000)) {
                break;
            }
        }

        return {
            items: episodeItems,
            newPagination: {
                titleId,
                page,
                isEnd
            }
        };
    },
    {
        condition: (titleId, { getState }) => {
            const { episode: {status, paginations: pages} } = getState() as RootState;
            if (status === 'loading') {
                return false;
            }
            if (pages.find(p => p.titleId === titleId)?.isEnd === true) {
                return false;
            }
        }
    }
);

export type EpisodeFilterType = { key: keyof EpisodeItem, value: string };

export type SeriesPaginationType = { titleId: `${number}`, page: number, isEnd: boolean};

export interface EpisodeState {
    status: 'idle' | 'loading' | 'failed';
    items: EpisodeItem[];
    paginations: SeriesPaginationType[];
    current: EpisodeItem | null;
    filter: EpisodeFilterType | null;
}

const initialState: EpisodeState = {
    status: 'idle',
    items: [],
    paginations: [],
    current: null,
    filter: null,
};

export const episodeSlice = createAppSlice({
    name: 'episode',
    initialState: initialState,
    reducers: {
        setCurrentEpisode: (state, action: PayloadAction<EpisodeItem|null>) => {
            state.current = action.payload;
        },
        setFilter: (state, action: PayloadAction<EpisodeFilterType|null>) => {
            state.filter = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getPageEpisodes.pending, (state) => {
            state.status = 'loading';
        }),
        builder.addCase(getPageEpisodes.fulfilled, (state, action) => {
            const titleId = action.payload.newPagination.titleId;
            state.paginations = [
                ...state.paginations.filter(p => p.titleId !== titleId),
                action.payload.newPagination
            ];
            
            const newItems = [
                ...state.items,
                ...action.payload.items
            ].filter((v, i, arr) => {
                return arr.slice(i+1).find(
                    fv => fv.seriesId === v.seriesId && fv.index === v.index
                ) === undefined;
            });

            state.items = newItems;

            state.status = 'idle';
        }),
        builder.addCase(getPageEpisodes.rejected, (state, _action) => {
            state.status = 'failed';
        }),

        builder.addCase(getAllEpisodes.pending, (state) => {
            state.status = 'loading';
        }),
        builder.addCase(getAllEpisodes.fulfilled, (state, action) => {
            const titleId = action.payload.newPagination.titleId;
            state.paginations = [
                ...state.paginations.filter(p => p.titleId !== titleId),
                action.payload.newPagination
            ];
            
            const newItems = [
                ...state.items,
                ...action.payload.items
            ].filter((v, i, arr) => {
                return arr.slice(i+1).find(
                    fv => fv.seriesId === v.seriesId && fv.index === v.index
                ) === undefined;
            });

            state.items = newItems;
            
            if (action.payload.newPagination.isEnd === true) {
                state.status = 'idle';
            } else {
                state.status = 'failed';
            }
        }),
        builder.addCase(getAllEpisodes.rejected, (state, _action) => {
            state.status = 'failed';
        })
    },
    selectors: {
    }
});

export const selectEpisodeItems = (state: RootState) => state.episode.items;

export const selectSeriesEpisodes = (titleId?: `${number}`) => createSelector(
    [selectEpisodeItems],
    (items: EpisodeItem[]) => titleId ? items.filter((ei) => ei.seriesId === titleId) : []
)

export const { 
    setCurrentEpisode,
    setFilter,
} = episodeSlice.actions;

// export const {
// } = episodeSlice.selectors;

export default episodeSlice.reducer;