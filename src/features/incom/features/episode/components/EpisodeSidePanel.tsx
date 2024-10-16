import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import EpisodePanelItem from "@incom/features/episode/components/EpisodePanelItem";
import { fetchEpisodes, selectSeriesEpisodes, setCurrentEpisode } from "@incom/features/episode/slice";
import { SeriesItem, type EpisodeItem } from "@shared/global";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type UIEvent } from "react";

interface EpisodeSidePanelProps extends ComponentProps<"div"> {}

export default function EpisodeSidePanel(props: EpisodeSidePanelProps) {
    const dispatch = useAppDispatch();
    const {current: currSeries} = useAppSelector(state => state.series);
    const {current: currEpisode} = useAppSelector(state => state.episode);
    const currentItems = useAppSelector(state => selectSeriesEpisodes(state, currSeries?.titleId));
    
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        console.log("Current titleId Changed");
        listRef.current?.firstElementChild?.scrollIntoView(true);
        tryDispatchFetch();
    }, [currSeries?.titleId]);
    
    useEffect(() => {
        if (listRef.current) {
            const el = listRef.current;
            if (el.clientHeight >= el.scrollHeight) {
                tryDispatchFetch();
            }
        }
    }, [currentItems, listRef.current?.clientHeight, listRef.current?.scrollHeight])

    const tryDispatchFetch = useCallback(() => {
        console.log("try dispatch fetch");
        if (currSeries != null) {
            dispatch(fetchEpisodes(currSeries.titleId));
        }
    }, [currSeries]);

    const handleScroll = function(event: UIEvent<HTMLUListElement>) {
        const el = event.target as HTMLUListElement;
        const isNearBottom = Math.abs(el.scrollHeight - (el.scrollTop + el.clientHeight)) <= el.clientHeight / 5;
        // const isBottom = Math.abs(el.scrollHeight - (el.scrollTop + el.clientHeight)) <= 1;
        if (isNearBottom) {
            tryDispatchFetch();
        }
    }

    const handleItemClick = function(item: EpisodeItem) {
        if (item === currEpisode) {
            dispatch(setCurrentEpisode(null));
        } else {
            dispatch(setCurrentEpisode(item));
        }
    }

    const visibleEpisodes = useMemo(() => {
        return currentItems.sort((a,b) => b.index - a.index);
    }, [currentItems]);

    return (
        <div className="h-full flex flex-col">
            <div>
                
            </div>
            <ul 
                ref={listRef}
                className="relative w-[320px] flex-auto overflow-y-auto scroll-smooth snap-y"
                onScroll={handleScroll}
            >
                {visibleEpisodes.map((ep, i) => (
                    <li key={i} className="border-b-[1px] snap-start">
                        <EpisodePanelItem 
                            item={ep}
                            selected={ep === currEpisode}
                            onClick={() => handleItemClick(ep)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}