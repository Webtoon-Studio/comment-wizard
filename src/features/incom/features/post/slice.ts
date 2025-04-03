import { createAppSlice } from "@incom/common/hook";
import { createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@incom/common/store";
import { INCOM_PATCH_POSTS_EVENT, INCOM_REQUEST_POSTS_EVENT, INCOM_RESPONSE_POSTS_EVENT, IS_DEV, type EpisodeItem, type SeriesItem } from "@shared/global";
import { IPost, IWebtoonPost, Post, type PostIdType } from "@shared/post";
import type { TitleIdType } from "@shared/webtoon";
import { mockPostData } from "@src/mock";
import { ITitle, Title } from "@shared/title";

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
        requestGetPosts: (state, action: PayloadAction<{ title: Title | null, episode: EpisodeItem | null }>) => {
            if (state.status === 'loading') return;

            if (action.payload.title === null) {
                state.status = "idle";
                state.items = [];
                return;
            }
            state.status = "loading";

            if (IS_DEV) {
				const mockPosts: IWebtoonPost[] = Array.from(new Array(100)).map(_ => mockPostData());
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent<{ posts: IWebtoonPost[] | null }>(
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
                            titleId: action.payload.title.id || undefined,
                            episodeNo: action.payload.episode?.index || undefined
                        }
                    }
                ));
            }
        },
        loadPosts: (state, action: PayloadAction<IPost[]|null>) => {
            if (action.payload === null) {
                state.status = "failed";
            } else {
                const posts = action.payload.map(p => new Post(p));
                if (IS_DEV) {
                    posts.forEach(p => {
                        p.replies = Array.from(new Array(p.replyCount)).map(_ => new Post(mockPostData(p.id)));
                    })
                }
                state.items = posts;
                state.status = 'idle';
            }
        },
        setCurrentPost: (state, action: PayloadAction<Post|null>) => {
            state.current = action.payload;
        },
        setPostRead: (state, action: PayloadAction<{postId: PostIdType}>) => {
            const post = state.items.find(p => p.id === action.payload.postId);
            if (post) {
                post.markAsRead()
                window.dispatchEvent(new CustomEvent<{posts: IPost[]}>(
                    INCOM_PATCH_POSTS_EVENT,
                    {
                        detail: {
                            posts: [post]
                        }
                    }
                ));
                state.items = [
                    ...state.items.filter(p => p.id !== action.payload.postId),
                    post
                ];
            }
        },
        setPostUnread: (state, action: PayloadAction<{postId: PostIdType}>) => {
            const post = state.items.find(p => p.id === action.payload.postId);
            if (post) {
                post.markAsNew()
                window.dispatchEvent(new CustomEvent<{posts: IPost[]}>(
                    INCOM_PATCH_POSTS_EVENT,
                    {
                        detail: {
                            posts: [post]
                        }
                    }
                ));
                state.items = [
                    ...state.items.filter(p => p.id !== action.payload.postId),
                    post
                ];
            }
        },
        setAllRead: (state, action: PayloadAction<{titleId: TitleIdType, episode?: number}>) => {
            const posts = state.items.filter(p => p.titleId === action.payload.titleId && (
                !action.payload.episode || p.episode === action.payload.episode
            ));

            if (posts.length > 0) {
                posts.forEach(p => {
                    p.markAsRead();
                    p.replies.forEach(r => r.markAsRead());
                });

                window.dispatchEvent(new CustomEvent<{posts: IPost[]}>(
                    INCOM_PATCH_POSTS_EVENT,
                    { detail: { posts } }
                ));

                state.items = [
                    ...state.items.filter(p => posts.find(_p => _p.id === p.id)),
                    ...posts
                ];
            }
        },
        setAllUnread: (state, action: PayloadAction<{titleId: TitleIdType, episode?: number}>) => {
            const posts = state.items.filter(p => p.titleId === action.payload.titleId && (
                !action.payload.episode || p.episode === action.payload.episode
            ));

            if (posts.length > 0) {
                posts.forEach(p => {
                    p.markAsNew();
                    p.replies.forEach(r => r.markAsNew());
                });

                window.dispatchEvent(new CustomEvent<{posts: IPost[]}>(
                    INCOM_PATCH_POSTS_EVENT,
                    { detail: { posts } }
                ));

                state.items = [
                    ...state.items.filter(p => posts.find(_p => _p.id === p.id)),
                    ...posts
                ];
            }
        },
        setReplyRead: (state, action: PayloadAction<{postId: PostIdType, replyId: PostIdType}>) => {
            const post = state.items.find(p => p.id === action.payload.postId);
            if (post) {
                const reply = post.replies.find(r => r.id === action.payload.replyId);
                if (reply) {
                    reply.markAsRead();
                    window.dispatchEvent(new CustomEvent<{posts: IPost[]}>(
                        INCOM_PATCH_POSTS_EVENT,
                        {
                            detail: {
                                posts: [post]
                            }
                        }
                    ));
                    state.items = [
                        ...state.items.filter(p => p.id !== action.payload.postId),
                        post
                    ];
                }
            }
        },
        setReplyUnread: (state, action: PayloadAction<{postId: PostIdType, replyId: PostIdType}>) => {
            const post = state.items.find(p => p.id === action.payload.postId);
            if (post) {
                const reply = post.replies.find(r => r.id === action.payload.replyId);
                if (reply) {
                    reply.markAsNew();
                    window.dispatchEvent(new CustomEvent<{posts: IPost[]}>(
                        INCOM_PATCH_POSTS_EVENT,
                        {
                            detail: {
                                posts: [post]
                            }
                        }
                    ));
                    state.items = [
                        ...state.items.filter(p => p.id !== action.payload.postId),
                        post
                    ];
                }
            }
        }
    },
    selectors: {

    }
});

export const { 
    requestGetPosts, loadPosts, setCurrentPost, 
    setPostRead, setPostUnread,
    setReplyRead, setReplyUnread
} = postSlice.actions;

// export const {
// } = postSlice.selectors;

export default postSlice.reducer;