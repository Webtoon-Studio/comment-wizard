import Loading from "@shared/components/Loading";
import { mockPostData, mockSeriesItem } from "@root/src/mock";
import type { Post } from "@shared/post";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	type EpisodeNewestPost,
	INCOM_ONMOUNTED_EVENT_NAME,
	INCOM_REQUEST_SERIES_ITEM_EVENT,
	INCOM_RESPONSE_SERIES_ITEM_EVENT,
	IS_DEV,
	POSTS_FETCHED_EVENT_NAME,
	type SeriesItem,
	isPostIdNewer,
} from "@shared/global";
import PostItem from "@incom/features/components/PostItem";
import ClientContainer from "@incom/features/client/components/ClientContainer";
import { useAppDispatch } from "@incom/common/hook";
import { hydrateSeries } from "@incom/features/series/slice";
import SeriesSidePanel from "@incom/features/series/components/SeriesSidePanel";
import PostSidePanel from "@incom/features/post/components/PostSidePanel";
import EpisodeSidePanel from "@incom/features/episode/components/EpisodeSidePanel";

export const IS_PROD = (() => {
	try {
		return import.meta.env.PROD;
	} catch {
		return true;
	}
})();

interface PaginationProps {
	count: number;
	page: number;
	perPage: number;
	onPageChange: (newPage: number) => void;
}

function Pagination(props: PaginationProps) {
	const { count, page, perPage, onPageChange } = props;

	if (perPage === 0) {
		return null;
	}

	const max = Math.ceil(count / perPage);
	return (
		<div className="h-16 flex items-center gap-2 select-none">
			<div
				className="cursor-pointer h-8 aspect-square flex justify-center items-center"
				onClick={() => onPageChange(0)}
			>
				{"<<"}
			</div>
			{Array.from(Array(max)).map((_, i) => (
				<div
					key={i}
					className={[
						"cursor-pointer h-8 aspect-square rounded-full bg-gray-100 text-sm flex justify-center items-center",
						"hover:text-webtoon",
						i === page ? "font-bold text-webtoon" : "text-black",
						i < max - 9 && page >= 5 && i <= page - 5 ? "hidden" : "",
						i >= 9 && i > page + 4 ? "hidden" : "",
					].join(" ")}
					onClick={() => onPageChange(i)}
				>
					{i + 1}
				</div>
			))}
			<div
				className="cursor-pointer h-8 aspect-square flex justify-center items-center"
				onClick={() => onPageChange(max - 1)}
			>
				{">>"}
			</div>
		</div>
	);
}

export default function Main() {
	const dispatch = useAppDispatch();
	const ref = useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [posts, setPosts] = useState<Post[] | null>(null);
	const [newest, setNewest] = useState<EpisodeNewestPost[] | null>(null);
	const [page, setPage] = useState(0);
	const [perPage, setPerPage] = useState(20);

	// OnMount
	//     - Set up event listner to communicate with service worker
	useEffect(() => {
		console.log("Is Prod?", IS_PROD);

		const handleSeriesItemResponse = (evt: CustomEvent<{ series: SeriesItem[] | null }>) => {
			console.log("Series Items Received");
			dispatch(hydrateSeries(evt.detail.series));
		}

		window.addEventListener(
			INCOM_RESPONSE_SERIES_ITEM_EVENT, 
			handleSeriesItemResponse as EventListener
		);

		if (IS_DEV) {
			const timeoutId = setTimeout(() => { setIsLoading(false); }, 400);

			return () => {

				window.removeEventListener(
					INCOM_RESPONSE_SERIES_ITEM_EVENT, 
					handleSeriesItemResponse as EventListener
				);

				clearTimeout(timeoutId);
			};
		} else {
			setIsLoading(false);

			return () => {
				window.removeEventListener(
					INCOM_RESPONSE_SERIES_ITEM_EVENT, 
					handleSeriesItemResponse as EventListener
				);
			}
		}
	}, []);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const visiblePosts: Post[] = useMemo(() => {
		return (
			posts
				?.slice(page * perPage, (page + 1) * perPage)
				?.map((p) => {
					const compared = newest?.find(
						(item) =>
							item.episode === p.episode && item.titleId === p.webtoonId,
					);
					p.isNew =
						p.id && compared
							? isPostIdNewer(p.id, compared.newestPostId)
							: false;
					return p;
				})
				?.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) || []
		);
	}, [posts, newest, page, perPage]);

	return (
		<div ref={ref} className={IS_DEV ? "w-[1110px]" : ""}>
			{/* <div className="absolute left-0 top-[-4rem] w-[300px] h-[3rem] px-4 py-2 border-2 rounded-full bg-[#8c8c8c] text-white font-medium">
        <div className="h-full flex items-center">
          <span>Filter</span>

        </div>
      </div> */}
			<ClientContainer>
				{!isLoading ? (
					<div className="w-full h-full flex ">
						<div className="h-full border-r-2">
							<SeriesSidePanel />
						</div>
						<div className="h-full border-r-2">
							<EpisodeSidePanel />
						</div>
					</div>
				) : (
					<div className="w-full min-h-[50vh] flex justify-center items-center pb-[10px]">
						<Loading />
					</div>
				)}
			</ClientContainer>
		</div>
	);
}
