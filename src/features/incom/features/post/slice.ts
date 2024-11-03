import { createAppSlice } from "@incom/common/hook";
import type { PayloadAction } from "@reduxjs/toolkit";
import { INCOM_REQUEST_POSTS_EVENT, INCOM_RESPONSE_POSTS_EVENT, IS_DEV, type EpisodeItem, type SeriesItem } from "@shared/global";
import { IPost, Post } from "@shared/post";
import type { TitleIdType } from "@shared/webtoon";
import { mockPostData } from "@src/mock";

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
        requestGetPosts: (state, action: PayloadAction<{ series: SeriesItem | null, episode: EpisodeItem | null }>) => {
            console.log("requestGetPosts");
            if (state.status === 'loading') return;

            if (action.payload.series === null) {
                state.status = "idle";
                state.items = [];
                return;
            }
            state.status = "loading";

            if (IS_DEV) {
				const mockPosts: IPost[] = Array.from(new Array(100)).map(_ => mockPostData());
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent<{ posts: IPost[] | null }>(
                        INCOM_RESPONSE_POSTS_EVENT,
                        {
                            detail: {
                                posts: mockPosts
                            }
                        }
                    ));
                }, 300);
            } else {
                window.dispatchEvent(new CustomEvent<{ titleId?: `${number}`, episodeNo?: number}>(
                    INCOM_REQUEST_POSTS_EVENT,
                    {
                        detail: {
                            titleId: action.payload.series.titleId || undefined,
                            episodeNo: action.payload.episode?.index || undefined
                        }
                    }
                ));
            }
        },
        loadPosts: (state, action: PayloadAction<IPost[]|null>) => {
            console.log("loadPosts");

            if (action.payload === null) {
                state.status = "failed";
            } else {
                state.items = action.payload.map(p => new Post(p));
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