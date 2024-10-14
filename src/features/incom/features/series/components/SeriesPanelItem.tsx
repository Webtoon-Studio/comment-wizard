import RefreshIcon from "@incom/features/components/RefreshIcon";
import type { SeriesItem } from "@shared/global";
import type { ComponentProps, MouseEvent } from "react";

interface SeriesPanelItemProps extends ComponentProps<"div"> {
    item?: SeriesItem;
    selected?: boolean;
    isLoading?: boolean;
}

export default function SeriesPanelItem(props: SeriesPanelItemProps) {
    const {
        item,
        selected = false,
        onClick
    } = props;


    const handleTitleClick = function(event: MouseEvent<HTMLDivElement>) {
        onClick?.(event);
    }

    return (
        <div 
            className={[
                "relative px-2 py-1 cursor-pointer rounded-md transition",
                item ? "hover:bg-gray-200" : "",
                selected ? "bg-gray-200 dark:bg-gray-900" : ""
            ].join(" ")}
        >
            <div 
                className="w-full flex items-center gap-2"
            >
                <div 
                    className={[
                        "flex-auto text-left select-none truncate",
                    ].join(" ")}
                    onClick={handleTitleClick}
                >
                    {item ? (
                        <span>
                            {item.title}
                        </span>
                    ) : (
                        <div className="inline-block h-4 w-[16ch] bg-gray-400 animate-pulse"/>
                    )}
                </div>
                <div className="text-xs text-gray-400">
                    {item?.titleId}
                </div>
            </div>
        </div>
    )
}