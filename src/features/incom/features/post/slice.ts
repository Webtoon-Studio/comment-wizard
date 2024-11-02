import { createAppSlice } from "@incom/common/hook";
import type { PayloadAction } from "@reduxjs/toolkit";
import { INCOM_REQUEST_POSTS_EVENT, INCOM_RESPONSE_POSTS_EVENT, IS_DEV } from "@shared/global";
import type { Post } from "@shared/post";

export interface PostState {
    status: 'idle' | 'loading' | 'hydrating' | 'failed';
    items: Post[];
    current: Post | null;
}

const initialState: PostState = {
    status: 'idle',
    items: [],
    current: null
};

export const postSlice = createAppSlice({
    name: 'post',
    initialState: initialState,
    reducers: {
        requestGetPosts: (state) => {
            console.log("requestGetPosts");
            if (state.status === 'loading') return;
            
            state.status = "loading";

            if (IS_DEV) {
				const mockPosts: Post[] = [];
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent<{ series: Post[] | null }>(
                        INCOM_RESPONSE_POSTS_EVENT,
                        {
                            detail: {
                                series: mockPosts
                            }
                        }
                    ));
                }, 300);
            } else {
                window.dispatchEvent(new CustomEvent(
                    INCOM_REQUEST_POSTS_EVENT
                ));
            }
        },
        loadPosts: (state, action: PayloadAction<Post[]|null>) => {
            console.log("loadPosts");

            if (action.payload === null) {
                state.status = "failed";
            } else {
                state.items = action.payload;
                state.status = 'idle';
            }
        },
        setCurrentPost: (state, action: PayloadAction<Post|null>) => {
            state.current = action.payload;
        },
    },
    selectors: {

    }
});

export const { 
    requestGetPosts, loadPosts, setCurrentPost
} = postSlice.actions;

export const {
} = postSlice.selectors;

export default postSlice.reducer;