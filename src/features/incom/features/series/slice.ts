import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { INCOM_REQUEST_SERIES_ITEM_EVENT, type SeriesItem } from "@shared/global";

export interface SeriesState {
    status: 'idle' | 'loading' | 'failed';
    seriesItems: SeriesItem[];
}

const initialState: SeriesState = {
    status: 'idle',
    seriesItems: [],
};

export const seriesSlice = createSlice({
    name: 'series',
    initialState: initialState,
    reducers: {
        fetchSeries: (state) => {
            window.dispatchEvent(new CustomEvent(
                INCOM_REQUEST_SERIES_ITEM_EVENT
            ));
        },
        hydrateSeries: (state, action: PayloadAction<SeriesItem[]>) => {
            state.seriesItems = action.payload;
        }
    },
    selectors: {
        selectSeries: (state) => state.seriesItems
    }
});

export const { 
    fetchSeries, hydrateSeries,
} = seriesSlice.actions;

export const {
    selectSeries
} = seriesSlice.selectors;

export default seriesSlice.reducer;