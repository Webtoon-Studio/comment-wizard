import type { SeriesItem } from "@shared/global";
import type { ComponentProps } from "react";

interface SeriesPanelItemProps extends ComponentProps<"div"> {
    item: SeriesItem;
}

export default function SeriesPanelItem(props: SeriesPanelItemProps) {
    const {
        item
    } = props;

    return (
        <div>
            
        </div>
    )
}