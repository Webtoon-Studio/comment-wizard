import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { INCOM_REQUEST_COUNTS_EVENT, INCOM_REQUEST_SERIES_ITEM_EVENT, INCOM_RESPONSE_COUNTS_EVENT, INCOM_RESPONSE_SERIES_ITEM_EVENT, IS_DEV, type SeriesItem } from "@shared/global";
import { PostCountType } from "@shared/post";
import type { Title } from "@shared/title";
import { mockTitles } from "@src/mock";

export interface CountState {
    status: 'idle' | 'loading' | 'hydrating' | 'failed';
    items: PostCountType[];
}

const initialState: CountState = {
    status: 'idle',
    items: [],
};

export const countSlice = createSlice({
    name: 'count',
    initialState: initialState,
    reducers: {
        fetch: (state) => {
            console.log("fetchCounts");

            if (state.status === 'loading') return;

            state.status = "loading";

            if (IS_DEV) {
                // const mockCountItems = Array.from(new Array(1 + Math.ceil(Math.random() * 5))).map(() => mockCounts());
                // setTimeout(() => {
                //     window.dispatchEvent(new CustomEvent<{ counts: PostCountType[] | null }>(
                //         INCOM_RESPONSE_COUNTS_EVENT,
                //         {
                //             detail: {
                //                 mockCountItems
                //             }
                //         }
                //     )); 
                // }, 300);
            } else {
                window.dispatchEvent(new CustomEvent(
                    INCOM_REQUEST_COUNTS_EVENT
                ));
            }
        },
        load: (state, action: PayloadAction<PostCountType[]|null>) => {
            console.log("loadCounts");

            if (action.payload === null) {
                state.status = "failed";
            } else {
                state.items = action.payload;
                state.status = 'idle';
            }
        }
    },
    selectors: {

    }
});

export const { 
    fetch: fetchCounts, 
    load: loadCounts
} = countSlice.actions;

// export const {
// } = titleSlice.selectors;

export default countSlice.reducer;