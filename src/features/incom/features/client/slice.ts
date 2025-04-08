import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { AppState, INCOM_REQUEST_STATE_EVENT, IS_DEV } from "@shared/global";
import { TitleIdType } from "@shared/webtoon";

export interface ClientState {
    status: "idle" | "loading" | "hydrating" | "fail";
    lastFetched: { titleId: TitleIdType; timestamp: number}[];
}

const initialState: ClientState = {
    status: "idle",
    lastFetched: []
};

export const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        fetch: (state) => {
            console.log("fetchAppState");
            if (state.status === "loading") return;
            
            state.status = "loading";

            if (IS_DEV) {
                // TODO
            } else {
                window.dispatchEvent(new CustomEvent(
                    INCOM_REQUEST_STATE_EVENT
                ));
            }
        },
        load: (state, action: PayloadAction<{ titleId: TitleIdType; timestamp: number}[]>) => {
            console.log("loadAppState");
            
            if (action.payload) {
                state.lastFetched = action.payload;
                state.status = "idle";
            }
        }
    }
});

export const {
    fetch: fetchClientState,
    load: loadClientState
} = clientSlice.actions;

export default clientSlice.reducer;