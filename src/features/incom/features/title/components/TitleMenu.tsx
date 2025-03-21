import { useAppDispatch } from "@incom/common/hook";
import Button from "@incom/features/components/Button";
import SyncIcon from "@incom/features/components/SyncIcon";
import { fetchTitles } from "@incom/features/title/slice";
import type { ComponentProps } from "react";

interface SyncButtonProps extends ComponentProps<"button"> {}

function SyncButton(props: SyncButtonProps) {
    const {
        onClick
    } = props;

    const colorClassName = "text-webtoon-dark";
    const hoverClassName = "hover:bg-white";
    const activeClassName = "active:text-gray-800";

    return (
        <Button
            type="button"
            title="Sync webtoon series info"
            variant="text"
            className={[
                colorClassName,
                hoverClassName,
                activeClassName
            ].join(" ")}
            onClick={onClick}
        >
            <SyncIcon />
        </Button>
    )
}

export default function TitleMenu() {
    const dispatch = useAppDispatch();

    const handleSync = function() {
        dispatch(fetchTitles());
    }

    return (
        <ul className="p-2">
            <li>
                <SyncButton 
                    onClick={handleSync}
                />
            </li>
        </ul>
    )
}