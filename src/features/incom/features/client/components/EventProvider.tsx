import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import { loadPosts, requestGetPosts } from "@incom/features/post/slice";
import { fetchSeries, hydrateSeries } from "@incom/features/series/slice";
import Loading from "@shared/components/Loading";
import { INCOM_RESPONSE_POSTS_EVENT, INCOM_RESPONSE_SERIES_ITEM_EVENT, IS_DEV, type SeriesItem } from "@shared/global";
import type { Post } from "@shared/post";
import { useEffect, useState, type ComponentProps } from "react";

interface EventProviderProps extends ComponentProps<"div"> {
}

export default function EventProvider(props: EventProviderProps) {
    const {
        children
    } = props;
    const dispatch = useAppDispatch();
	const { series: {status: seriesStatus}, post: {status: postStatus}} = useAppSelector(state => state);
	const [isSeriesLoading, setIsSeriesLoading] = useState(true);
	const [isPostsLoading, setIsPostsLoading] = useState(true);

	// OnMount
	//     - Set up event listner to communicate with service worker
	useEffect(() => {
		console.log("Is Dev?", IS_DEV);

		const handleSeriesItemResponse = (evt: CustomEvent<{ series: SeriesItem[] | null }>) => {
			if (isSeriesLoading) setIsSeriesLoading(false);
			dispatch(hydrateSeries(evt.detail.series));
		}

		const handlePostItemsResponse = (evt: CustomEvent<{ posts: Post[] | null }>) => {
			if (isPostsLoading) setIsPostsLoading(false);
			dispatch(loadPosts(evt.detail.posts));
		}

		window.addEventListener(
			INCOM_RESPONSE_SERIES_ITEM_EVENT, 
			handleSeriesItemResponse as EventListener
		);

		window.addEventListener(
			INCOM_RESPONSE_POSTS_EVENT,
			handlePostItemsResponse as EventListener
		);

		return () => {
			window.removeEventListener(
				INCOM_RESPONSE_SERIES_ITEM_EVENT, 
				handleSeriesItemResponse as EventListener
			);
			window.removeEventListener(
				INCOM_RESPONSE_POSTS_EVENT, 
				handleSeriesItemResponse as EventListener
			);
		}
	}, []);

	useEffect(() => {
		if (isSeriesLoading) {
			(async () => new Promise(resolve => setTimeout(resolve, 300)))().then(() => {
				dispatch(fetchSeries());
			});
		}
	}, [isSeriesLoading]);

	useEffect(() => {
		if (isPostsLoading) {
			(async () => new Promise(resolve => setTimeout(resolve, 300)))().then(() => {
				dispatch(requestGetPosts());
			});
		}
	}, [isPostsLoading]);

    return (
        <div>
            {!isSeriesLoading && !isPostsLoading ? (
                children
            ) : (
                <div className="w-full h-full flex justify-center items-center pb-[10px]">
					{isSeriesLoading ? "true" : "false"}
					{isPostsLoading ? "true" : "false"}
                    <Loading />
                </div>
            )}
        </div>
    )
}