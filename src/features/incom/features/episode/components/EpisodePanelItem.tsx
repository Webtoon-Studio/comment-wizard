import { useAppSelector } from "@incom/common/hook";
import CountBubble from "@incom/features/count/components/CountBubble";
import type { EpisodeItem } from "@shared/global";
import { useContext, useEffect, useMemo, useRef, type ComponentProps, type MouseEvent } from "react";

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

    const rootRef = useRef<HTMLDivElement>(null);
    const { items: countItems } = useAppSelector(state => state.count);

    const handleClick = function(event: MouseEvent<HTMLDivElement>) {
        onClick?.(event);
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
        >
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