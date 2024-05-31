import { IS_PROD } from "@incom/main";
import { INCOM_ONMOUNTED_EVENT_NAME, INCOM_UPLOAD_REQUEST_EVENT_NAME, POSTS_FETCHED_EVENT_NAME, POSTS_UPDATED_EVENT_NAME } from "@root/src/global";
import { mockPostData } from "@root/src/mock";
import { Post } from "@root/src/post";
import { Webtoon } from "@root/src/webtoon";
import { ComponentProps, Context, createContext, useCallback, useEffect, useState } from "react";

export interface CommentContextProps {
    isLoading: boolean;
    comments?: Post[];
    updateComments: (newComments: Post[]) => void;
}

export const commentContext: Context<CommentContextProps> = createContext<CommentContextProps>({
    isLoading: true,
	updateComments: (newComments: Post[]) => {},
});

interface CommentProviderProps extends Pick<ComponentProps<"div">, "children"> {}

export default function CommentProvider({children}: CommentProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<Post[]>();

	// OnMount
	//     - Set up event listner to communicate with service worker
	useEffect(() => {
		console.log("Is Prod?", IS_PROD);
		if (IS_PROD) {
			console.log("setting event listener in main");
			window.addEventListener(POSTS_FETCHED_EVENT_NAME, ((
				event: CustomEvent<{ webtoons: Webtoon[] }>,
			) => {
				console.log("event received: ", event);
				const fetchedWebtoons = event.detail.webtoons;
				let fetchedPosts: Post[] = [];
				for (let wt of fetchedWebtoons) {
					for (let posts of wt.postsArray) {
						for (let p of posts.posts) {
							fetchedPosts.push(Post.fromCached(p));
						}
					}
				}
				setComments(fetchedPosts);
				setIsLoading(false);
			}) as EventListener);
			window.dispatchEvent(new CustomEvent(INCOM_ONMOUNTED_EVENT_NAME));
		} else {
			setComments(Array.from(new Array(5000)).map(() => mockPostData()));
			setTimeout(() => setIsLoading(false), 500);
		}
	}, []);

    const uploadComments = useCallback(() => {
        window.dispatchEvent(new CustomEvent(INCOM_UPLOAD_REQUEST_EVENT_NAME, {
            detail: {
                posts: comments
            }
        }));
    }, [comments])

    const updateComments = function(newComments: Post[]) {
        setComments(newComments);
        uploadComments();
    }

    return (
        <commentContext.Provider value={{isLoading, comments, updateComments}}>
            {children}
        </commentContext.Provider>
    )
}