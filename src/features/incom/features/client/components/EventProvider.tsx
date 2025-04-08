import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import { loadPosts, requestGetPosts } from "@incom/features/post/slice";
import { fetchTitles, hydrateTitles } from "@incom/features/title/slice";
import { fetchCounts, loadCounts } from "@incom/features/count/slice";
import Loading from "@shared/components/Loading";
import { AppState, INCOM_RESPONSE_COUNTS_EVENT, INCOM_RESPONSE_POSTS_EVENT, INCOM_RESPONSE_SERIES_ITEM_EVENT, INCOM_RESPONSE_STATE_EVENT, IS_DEV, type SeriesItem } from "@shared/global";
import type { Post, PostCountType } from "@shared/post";
import { Title } from "@shared/title";
import { useEffect, useState, type ComponentProps } from "react";
import { fetchClientState, loadClientState } from "@incom/features/client/slice";
import { TitleIdType } from "@shared/webtoon";

interface EventProviderProps extends ComponentProps<"div"> {
}

export default function EventProvider(props: EventProviderProps) {
    const {
        children
    } = props;
    const dispatch = useAppDispatch();
	const { 
		title: {status: seriesStatus}, 
		post: {status: postStatus}
	} = useAppSelector(state => state);
	const [isStateLoaded, setStateLoaded] = useState(false);
	const [isTitlesLoading, setIsTitlesLoading] = useState(true);

	// OnMount
	//     - Set up event listner to communicate with service worker
	useEffect(() => {
		console.log("Is Dev?", IS_DEV);

		const handleStateResponse = (evt: CustomEvent<{ state: AppState }>) => {
			if (!isStateLoaded) setStateLoaded(true);
			dispatch(loadClientState(evt.detail.state.lastScraped))
		}

		const handleTitleItemResponse = (evt: CustomEvent<{ titles: Title[] | null }>) => {
			if (isTitlesLoading) setIsTitlesLoading(false);
			dispatch(hydrateTitles(evt.detail.titles?.map(t => new Title(t)) || null));
		}

		const handlePostItemsResponse = (evt: CustomEvent<{ posts: Post[] | null }>) => {
			dispatch(loadPosts(evt.detail.posts));
		}

		const handleCountsItemsResponse = (evt: CustomEvent<{ counts: PostCountType[] | null }>) => {
			dispatch(loadCounts(evt.detail.counts));
		}

		window.addEventListener(
			INCOM_RESPONSE_STATE_EVENT,
			handleStateResponse as EventListener
		);

		window.addEventListener(
			INCOM_RESPONSE_SERIES_ITEM_EVENT, 
			handleTitleItemResponse as EventListener
		);

		window.addEventListener(
			INCOM_RESPONSE_POSTS_EVENT,
			handlePostItemsResponse as EventListener
		);

		window.addEventListener(
			INCOM_RESPONSE_COUNTS_EVENT,
			handleCountsItemsResponse as EventListener
		);

		return () => {
			window.removeEventListener(
				INCOM_RESPONSE_STATE_EVENT,
				handleStateResponse as EventListener
			)
			window.removeEventListener(
				INCOM_RESPONSE_SERIES_ITEM_EVENT, 
				handleTitleItemResponse as EventListener
			);
			window.removeEventListener(
				INCOM_RESPONSE_POSTS_EVENT, 
				handlePostItemsResponse as EventListener
			);
			window.removeEventListener(
				INCOM_RESPONSE_COUNTS_EVENT,
				handleCountsItemsResponse as EventListener
			);
		}
	});

	useEffect(() => {
		if (!isStateLoaded) {
			(async () => new Promise(resolve => setTimeout(resolve, 300)))().then(() => {
				dispatch(fetchClientState());
			})
		} else {
			if (isTitlesLoading) {
				(async () => new Promise(resolve => setTimeout(resolve, 300)))().then(() => {
					dispatch(fetchTitles());
					dispatch(fetchCounts());
				});
			}
		}
	}, [isStateLoaded, isTitlesLoading]);

    return (
        <div>
            {isStateLoaded && !isTitlesLoading ? (
                children
            ) : (
                <div className="w-full h-full min-h-[480px] flex justify-center items-center pb-[10px]">
                    <Loading />
                </div>
            )}
        </div>
    )
}