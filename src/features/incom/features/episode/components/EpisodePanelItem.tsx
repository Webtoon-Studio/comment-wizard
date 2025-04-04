import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import Button from "@incom/features/components/Button";
import ContextMenu from "@incom/features/components/ContextMenu";
import CountBubble from "@incom/features/count/components/CountBubble";
import { setAllRead, setAllUnread } from "@incom/features/post/slice";
import type { EpisodeItem } from "@shared/global";
import { useContext, useEffect, useMemo, useRef, useState, type ComponentProps, type MouseEvent } from "react";

interface EpisodePanelItemProps extends ComponentProps<"div"> {
    item?: EpisodeItem;
    selected?: boolean;
}

export default function EpisodePanelItem(props: EpisodePanelItemProps) {
    const {
        item,
        selected = false,

        onClick,
    } = props;
    const dispatch = useAppDispatch();
    const rootRef = useRef<HTMLDivElement>(null);
    const { items: countItems } = useAppSelector(state => state.count);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{x:number; y:number;}>({x:0, y:0});

    const handleClick = function(event: MouseEvent<HTMLDivElement>) {
        onClick?.(event);
    }

    const handleContextMenu = function(event: MouseEvent<HTMLDivElement>) {
        setMenuPosition({
            x: event.clientX,
            y: event.clientY
        })
        setMenuOpen(true);
    }

    const handleContextMenuClose = () => {
        setMenuOpen(false);
    }

    const handleMarkAllRead = function(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        console.log("marking all read for:", item);
        if (item) {
            dispatch(setAllRead({titleId: item.seriesId, episode: item.index}));
            setMenuOpen(false);
        }
    }

    const handleMarkAllUnread = function(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        if (item) {
            dispatch(setAllUnread({titleId: item.seriesId, episode: item.index}));
            setMenuOpen(false);
        }

    }

    const count = useMemo(() => {
        const thisCounts = countItems.find(c => c.titleId === item?.seriesId);
        if (!thisCounts || !thisCounts.isCompleted) {
            return null;
        }
        const thisEpisodeCounts = thisCounts.episodes.find(e => e.number === item?.index);
        if (!thisEpisodeCounts || !thisEpisodeCounts.isCompleted) {
            return null;
        }
        return thisEpisodeCounts.newCount;
    }, [countItems, item]);

    const isAllNew = useMemo(() => {
        const thisCounts = countItems.find(c => c.titleId === item?.seriesId);
        if (!thisCounts || !thisCounts.isCompleted) {
            return false;
        }
        const thisEpisodeCounts = thisCounts.episodes.find(e => e.number === item?.index);
        if (!thisEpisodeCounts || !thisEpisodeCounts.isCompleted) {
            return false;
        }
        return thisEpisodeCounts.count === thisEpisodeCounts.newCount;
    }, [countItems, item]);

    const isCompleted = useMemo(() => {
        const thisCounts = countItems.find(c => c.titleId === item?.seriesId);
        if (!thisCounts || !thisCounts.isCompleted) {
            return false;
        }
        const thisEpisodeCounts = thisCounts.episodes.find(e => e.number === item?.index);
        if (!thisEpisodeCounts || !thisEpisodeCounts.isCompleted) {
            return false;
        }
        return true;
    }, [countItems, item]);

    return (
        <div 
            className={[
                "relative w-full px-4 py-2 flex items-stretch gap-2 overflow-x-clip cursor-default select-none",
                item ? (
                    selected ? "hover:bg-slate-200/50" : "hover:bg-slate-100" 
                ) : "",
                selected ? "bg-slate-200 dark:bg-gray-900" : ""

            ].join(" ")}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
        >
            <ContextMenu open={menuOpen} position={menuPosition} onClose={handleContextMenuClose}>
                <Button 
                    className="hover:text-gray-500"
                    disabled={count === 0 || count === null}
                    onClick={handleMarkAllRead}
                >
                    Mark all as read
                </Button>
                <Button 
                    className="hover:text-gray-500"
                    disabled={isAllNew || !isCompleted}
                    onClick={handleMarkAllUnread}
                >
                    Mark all as unread
                </Button>
            </ContextMenu>
            <div className="h-full flex items-center">
                <div className="w-[32px] h-[32px] overflow-clip rounded-md">
                    {item ? (
                        <img src={item.thumb} alt={item.title}/>
                    ) : (
                        <div className="w-full h-full bg-gray-400 animate-pulse"/>
                    )}
                </div>
            </div>
            <div className="flex-auto">
                <div className="text-xs text-gray-400">
                    {item ? (
                        <span># {item.index}</span>
                    ): (
                        <div className="inline-block w-[4ch] h-[1em] bg-gray-400 animate-pulse rounded-sm"/>
                    )}
                </div>
                <div className="">
                    {item ? (
                        <span>{item.title}</span>
                    ) : (
                        <div className="inline-block w-full h-[1em] px-2 bg-gray-400 animate-pulse rounded-sm"/>
                    )}
                </div>
            </div>
            <div>
                <CountBubble count={count} />
            </div>
        </div>
    )
}