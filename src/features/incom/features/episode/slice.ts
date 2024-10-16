import { createAppSlice } from "@incom/common/hook";
import type { RootState } from "@incom/common/store";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { IS_DEV, type EpisodeItem } from "@shared/global";
import { mockEnd, mockEpisodeItems, mockSeriesItem } from "@src/mock";

export const fetchEpisodes = createAsyncThunk<
    { items: EpisodeItem[], newPagination: SeriesPaginationType },
    `${number}`,
    {
        state: RootState,
        rejectedMeta: {
            message: string
        }
    }
>(
    "episode/fetchEpisodes",
    async (titleId, thunkAPI) => {
        const { episode: { paginations: pagination }, series: { seriesItems } } = thunkAPI.getState() as RootState;
        const page = (pagination.find(p => p.titleId === titleId)?.page || 0) + 1; // incremented
        
        const targetSeries = seriesItems.find(s => s.titleId === titleId);
        const subfix = page > 1 ? `&&page=${page}` : "";
        const url = targetSeries ? targetSeries.link + subfix :`https://www.webtoons.com/en/canvas/_/list?title_no=${titleId}${subfix}`;

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

        const episodeItems: EpisodeItem[] = [];

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
        for (let item of queriedItems) {
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
)

export type SeriesPaginationType = { titleId: `${number}`, page: number, isEnd: boolean};

export interface EpisodeState {
    status: 'idle' | 'loading' | 'failed';
    items: EpisodeItem[];
    paginations: SeriesPaginationType[];
    current: EpisodeItem | null;
}

const initialState: EpisodeState = {
    status: 'idle',
    items: [],
    paginations: [],
    current: null,
};

export const episodeSlice = createAppSlice({
    name: 'episode',
    initialState: initialState,
    reducers: {
        setCurrentEpisode: (state, action: PayloadAction<EpisodeItem|null>) => {
            state.current = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchEpisodes.pending, (state) => {
            state.status = 'loading';
        }),
        builder.addCase(fetchEpisodes.fulfilled, (state, action) => {
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
        builder.addCase(fetchEpisodes.rejected, (state, _action) => {
            state.status = 'failed';
        })
    },
    selectors: {
        selectSeriesEpisodes: (state, titleId?: `${number}`) => titleId ? state.items.filter((ei) => ei.seriesId === titleId) : [],
    }
});

export const { 
    setCurrentEpisode
} = episodeSlice.actions;

export const {
    selectSeriesEpisodes
} = episodeSlice.selectors;

export default episodeSlice.reducer;