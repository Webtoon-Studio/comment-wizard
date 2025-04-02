import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { INCOM_REQUEST_SERIES_ITEM_EVENT, INCOM_RESPONSE_SERIES_ITEM_EVENT, IS_DEV, type SeriesItem } from "@shared/global";
import type { Title } from "@shared/title";
import { mockTitles } from "@src/mock";

export interface TitleState {
    status: 'idle' | 'loading' | 'hydrating' | 'failed';
    items: Title[];
    current: Title | null;
}

const initialState: TitleState = {
    status: 'idle',
    items: [],
    current: null
};

export const titleSlice = createSlice({
    name: 'title',
    initialState: initialState,
    reducers: {
        fetchTitles: (state) => {
            console.log("fetchSeries");

            if (state.status === 'loading') return;

            state.status = "loading";

            if (IS_DEV) {
				const mockTitleItems = Array.from(new Array(1 + Math.ceil(Math.random() * 5))).map(() => mockTitles());
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent<{ titles: Title[] | null }>(
                        INCOM_RESPONSE_SERIES_ITEM_EVENT,
                        {
                            detail: {
                                titles: mockTitleItems
                            }
                        }
                    )); 
                }, 300);
            } else {
                window.dispatchEvent(new CustomEvent(
                    INCOM_REQUEST_SERIES_ITEM_EVENT
                ));
            }
        },
        hydrateTitles: (state, action: PayloadAction<Title[]|null>) => {
            console.log("hydrateSeries");

            if (action.payload === null) {
                state.status = "failed";
            } else {
                state.items = action.payload;
                state.status = 'idle';
            }
        },
        setCurrentTitle: (state, action: PayloadAction<Title|null>) => {
            state.current = action.payload;
        },
    },
    selectors: {

    }
});

export const { 
    fetchTitles, hydrateTitles, setCurrentTitle
} = titleSlice.actions;

// export const {
// } = titleSlice.selectors;

export default titleSlice.reducer;