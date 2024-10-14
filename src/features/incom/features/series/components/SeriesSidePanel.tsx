import { useAppSelector } from "@incom/common/hook";
import SeriesPanelItem from "@incom/features/series/components/SeriesPanelItem";
import { selectSeries } from "@incom/features/series/slice";
import type { ComponentProps } from "react";

interface SeriesSidePanelProps extends ComponentProps<"div"> {}

export default function SeriesSidePanel(props: SeriesSidePanelProps) {
    const {

    } = props;

    const series = useAppSelector(selectSeries);

    return (
        <ul className="w-[220px]">
            {series.map((s,i) => (
                <li key={i} className="border-2">
                    <SeriesPanelItem item={s} />
                </li>
            ))}
        </ul>
    )
}