import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { INCOM_REQUEST_SERIES_ITEM_EVENT, INCOM_RESPONSE_SERIES_ITEM_EVENT, IS_DEV, type SeriesItem } from "@shared/global";
import { mockSeriesItem } from "@src/mock";

export interface SeriesState {
    status: 'idle' | 'loading' | 'hydrating' | 'failed';
    seriesItems: SeriesItem[];
    current: SeriesItem | null;
}

const initialState: SeriesState = {
    status: 'idle',
    seriesItems: [],
    current: null
};

export const seriesSlice = createSlice({
    name: 'series',
    initialState: initialState,
    reducers: {
        fetchSeries: (state) => {
            state.status = "loading";

            if (IS_DEV) {
				const mockSeries = Array.from(new Array(1 + Math.ceil(Math.random() * 5))).map(() => mockSeriesItem());
				state.seriesItems = mockSeries;
                state.status = 'idle';
            } else {
                window.dispatchEvent(new CustomEvent(
                    INCOM_REQUEST_SERIES_ITEM_EVENT
                ));
            }
        },
        hydrateSeries: (state, action: PayloadAction<SeriesItem[]|null>) => {
            if (action.payload === null) {
                state.status = "failed";
            } else {
                state.seriesItems = action.payload;
                state.status = 'idle';
            }
        },
        setCurrentSeries: (state, action: PayloadAction<SeriesItem|null>) => {
            state.current = action.payload;
        },
    },
    selectors: {

    }
});

export const { 
    fetchSeries, hydrateSeries, setCurrentSeries
} = seriesSlice.actions;

export const {
} = seriesSlice.selectors;

export default seriesSlice.reducer;