import RefreshIcon from "@incom/features/components/RefreshIcon";
import type { SeriesItem } from "@shared/global";
import type { ComponentProps, MouseEvent } from "react";

interface SeriesPanelItemProps extends ComponentProps<"div"> {
    item: SeriesItem;
    selected?: boolean;
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
                "relative px-2 py-6 cursor-default",
                selected ? "bg-gray-100 dark:bg-gray-900" : ""
            ].join(" ")}
        >
            <div className="absolute top-0 left-1 right-1 p-1 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <div>
                    <span>Id: {item.titleId}</span>
                </div>
                <div>
                    <RefreshIcon />
                </div>
            </div>
            <div 
                className={[
                    "text-center cursor-pointer hover:font-medium",
                    selected ? "font-medium" : "font-normal"
                ].join(" ")}
                onClick={handleTitleClick}
            >
                <span>
                    {item.title}
                </span>
            </div>
        </div>
    )
}