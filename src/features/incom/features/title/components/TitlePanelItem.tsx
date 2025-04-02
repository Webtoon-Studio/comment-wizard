import { useAppSelector } from "@incom/common/hook";
import RefreshIcon from "@incom/features/components/RefreshIcon";
import type { Title } from "@shared/title";
import { useMemo, type ComponentProps, type MouseEvent } from "react";

interface TitlePanelItemProps extends ComponentProps<"div"> {
    item?: Title;
    selected?: boolean;
    isLoading?: boolean;
}

export default function TitlePanelItem(props: TitlePanelItemProps) {
    const {
        item,
        selected = false,
        onClick
    } = props;
    const { items: countItems } = useAppSelector(state => state.count);

    const handleClick = function(event: MouseEvent<HTMLDivElement>) {
        onClick?.(event);
    }

    const count = useMemo(() => {
        const thisCounts = countItems.find(c => c.titleId === item?.id);
        return thisCounts && thisCounts.isCompleted ? thisCounts.totalNewCount : null;
    }, [countItems]);

    return (
        <div 
            className={[
                "relative px-2 py-1 cursor-pointer rounded-md transition select-none",
                item ? (
                    selected ? "hover:bg-gray-200/50" : "hover:bg-white" 
                ) : "",
                selected ? "bg-gray-200 dark:bg-gray-900" : ""
            ].join(" ")}
            onClick={handleClick}
        >
            <div 
                className="w-full flex items-center gap-2"
            >
                <div 
                    className={[
                        "flex-auto text-left truncate",
                    ].join(" ")}
                >
                    {item ? (
                        <div className="space-x-2">
                            <span>
                                {item.subject}
                            </span>
                            <span className="text-xs text-gray-400">
                                {item.id}
                            </span>
                        </div>
                    ) : (
                        <div className="inline-block h-4 w-[16ch] bg-gray-400 animate-pulse"/>
                    )}
                </div>
                <div className="flex items-center px-2 py-1 rounded-full text-xs bg-red-400 text-white">
                    {count === null ? ".." : count}
                </div>
            </div>
        </div>
    )
}