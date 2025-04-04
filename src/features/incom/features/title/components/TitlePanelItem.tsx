import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import Button from "@incom/features/components/Button";
import RefreshIcon from "@incom/features/components/RefreshIcon";
import CountBubble from "@incom/features/count/components/CountBubble";
import ContextMenu from "@incom/features/components/ContextMenu";
import type { Title } from "@shared/title";
import { useMemo, useState, type ComponentProps, type MouseEvent } from "react";
import { setAllRead, setAllUnread } from "@incom/features/post/slice";

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
    const dispatch = useAppDispatch();
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
            dispatch(setAllRead({titleId: item.id}));
            setMenuOpen(false);
        }
    }

    const handleMarkAllUnread = function(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        if (item) {
            dispatch(setAllUnread({titleId: item.id}));
            setMenuOpen(false);
        }

    }

    const count = useMemo(() => {
        const thisCounts = countItems.find(c => c.titleId === item?.id);
        return thisCounts && thisCounts.isCompleted ? thisCounts.totalNewCount : null;
    }, [countItems, item]);

    const isAllNew = useMemo(() => {
        const thisCounts = countItems.find(c => c.titleId === item?.id);
        return thisCounts && thisCounts.isCompleted && thisCounts.totalCount === thisCounts.totalNewCount;
    }, [countItems, item]);

    const isCompleted = useMemo(() => {
        const thisCounts = countItems.find(c => c.titleId === item?.id);
        return thisCounts && thisCounts.isCompleted;
    }, [countItems, item]);

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
                <div>
                    <CountBubble count={count} />
                </div>
            </div>
        </div>
    )
}