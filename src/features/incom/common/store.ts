import { combineReducers, configureStore, type Action, type ThunkAction } from "@reduxjs/toolkit";
import clientReducer from "@incom/features/client/slice";
import titleReducer from "@incom/features/title/slice";
import episodeReducer from "@incom/features/episode/slice";
import postReducer from "@incom/features/post/slice";
import countReducer from "@incom/features/count/slice";

export const store = configureStore({
    reducer: combineReducers({
        client: clientReducer,
        title: titleReducer,
        episode: episodeReducer,
        post: postReducer,
        count: countReducer
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