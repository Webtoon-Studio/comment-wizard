import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import EpisodeMenu from "@incom/features/episode/components/EpisodeMenu";
import EpisodePanelItem from "@incom/features/episode/components/EpisodePanelItem";
import { getAllEpisodes, getPageEpisodes, selectSeriesEpisodes, setCurrentEpisode } from "@incom/features/episode/slice";
import { SeriesItem, type EpisodeItem } from "@shared/global";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type UIEvent } from "react";

interface EpisodeSidePanelProps extends ComponentProps<"div"> {}

export default function EpisodeSidePanel(props: EpisodeSidePanelProps) {
    const dispatch = useAppDispatch();
    const {current: currSeries} = useAppSelector(state => state.series);
    const {status, current: currEpisode, paginations, filter} = useAppSelector(state => state.episode);
    const currentItems = useAppSelector((state) => selectSeriesEpisodes(currSeries?.titleId)(state));
    
    const listRef = useRef<HTMLUListElement>(null);

    // Effect: Do the first fetch when a series is selected
    useEffect(() => {
        console.log("Current titleId Changed");
        listRef.current?.scrollTo({top: 0});
        if (currSeries != null) {
            dispatch(getPageEpisodes(currSeries.titleId));
        }
    }, [currSeries]);
    
    // Effect: Fetch until the current scroll view is full
    useEffect(() => {
        if (
            status === 'idle' &&
            listRef.current && 
            currSeries !== null && 
            paginations.find(p => p.titleId === currSeries.titleId)?.isEnd !== true &&
            filter === null
        ) {
            const el = listRef.current;
            if (el.clientHeight >= el.scrollHeight) {
                dispatch(getPageEpisodes(currSeries.titleId));
            }
        }
    }, [currentItems, listRef.current?.clientHeight, listRef.current?.scrollHeight, filter]);

    // Effect: When filter is on, fetch all
    useEffect(() => {
        if (currSeries !== null && filter !== null && paginations.find(p => p.titleId === currSeries?.titleId)?.isEnd !== true) {
            console.log("Dispatching getAllEpisodes");
            dispatch(getAllEpisodes(currSeries.titleId));
        }
    }, [currSeries, filter]);

    const handleScroll = useCallback(function(event: UIEvent<HTMLUListElement>) {
        if (filter !== null) return;

        const el = event.target as HTMLUListElement;
        const isNearBottom = Math.abs(el.scrollHeight - (el.scrollTop + el.clientHeight)) <= el.clientHeight / 5;
        // const isBottom = Math.abs(el.scrollHeight - (el.scrollTop + el.clientHeight)) <= 1;
        if (
            isNearBottom && 
            currSeries !== null && 
            paginations.find(p => p.titleId === currSeries.titleId)?.isEnd !== true
        ) {
            dispatch(getPageEpisodes(currSeries.titleId));
        }
    }, [currSeries, paginations, filter]);
    
    const handleItemClick = function(item: EpisodeItem) {
        if (item === currEpisode) {
            dispatch(setCurrentEpisode(null));
        } else {
            dispatch(setCurrentEpisode(item));
        }
    }
    
    const visibleEpisodes = useMemo(() => {
        if (currentItems.length === 0) {
            return [];
        }
        let newItems = currentItems.slice();
        if (filter) {
            newItems = newItems.filter((v) => {
                let mess = v[filter.key];
                if (typeof mess === 'number') mess = mess.toString();
                mess = mess.toLowerCase();

                return mess.match(filter.value.trim().toLowerCase());
            });
            newItems.sort((a,b) => {
                return a[filter.key].toString().length - b[filter.key].toString().length;
            })
        } else {
            newItems.sort((a,b) =>  b.index - a.index);
        }

        return newItems;
    }, [currentItems, filter]);

    return (
        <div className="h-full flex flex-col">
            <div className="border-b-2">
                <EpisodeMenu />
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
                {status === 'loading' ? (
                    <EpisodePanelItem />
                ) : null}
            </ul>
        </div>
    );
}