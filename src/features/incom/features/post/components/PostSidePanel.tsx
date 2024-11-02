import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import { getPageEpisodes } from "@incom/features/episode/slice";
import { useEffect, type ComponentProps } from "react";

interface PostSidePanelProps extends ComponentProps<"div"> {}

export default function PostSidePanel(props: PostSidePanelProps) {

    return (
        <div className="h-full">
        </div>
    );
}