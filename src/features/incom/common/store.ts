import { combineReducers, configureStore, type Action, type ThunkAction } from "@reduxjs/toolkit";
import seriesReducer from "@incom/features/series/slice";

export const store = configureStore({
    reducer: combineReducers({
        series: seriesReducer,
    }),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
    ThunkReturnType,
    RootState,
    unknown,
    Action
>;