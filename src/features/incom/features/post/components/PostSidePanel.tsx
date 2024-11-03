import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import { getPageEpisodes } from "@incom/features/episode/slice";
import PostPanelItem from "@incom/features/post/components/PostPanelItem";
import { requestGetPosts } from "@incom/features/post/slice";
import { useEffect, useMemo, type ComponentProps } from "react";

interface PostSidePanelProps extends ComponentProps<"div"> {}

export default function PostSidePanel(props: PostSidePanelProps) {
    const {

    } = props;
    const dispatch = useAppDispatch();
    const { current: currentSeries } = useAppSelector(state => state.series);
    const { current: currentEpisode } = useAppSelector(state => state.episode);
    const { status, items: posts } = useAppSelector(state => state.post);

    useEffect(() => {
        dispatch(requestGetPosts({ series: currentSeries, episode: currentEpisode }));
    }, [currentSeries, currentEpisode]);

    // const handleSelect = function(item: Post) {
    //     if (item === current) {
    //         dispatch(setCurrentSeries(null));
    //     } else {
    //         dispatch(setCurrentSeries(item));
    //     }
    // }

    const visiblePosts = useMemo(() => {
        return posts.slice().sort((a, b) => b.createdAt - a.createdAt);
    }, [posts]);

    return (
        <div className="w-full h-full flex flex-col">
            
            <ul className="w-full flex-auto overflow-y-auto scroll-smooth snap-y">
                {status === 'idle' ? visiblePosts.map((p, i) => (
                    <li key={i} className="border-b-[1px] snap-start">
                        <PostPanelItem item={p} />
                    </li>
                )) : (
                    <li>
                        loading
                    </li>
                )}
            </ul>
        </div>
    )
}