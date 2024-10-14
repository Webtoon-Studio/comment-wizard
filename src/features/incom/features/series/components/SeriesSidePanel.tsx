import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import SeriesPanelItem from "@incom/features/series/components/SeriesPanelItem";
import { fetchSeries, selectSeries } from "@incom/features/series/slice";
import { useEffect, useState, type ComponentProps } from "react";

interface SeriesSidePanelProps extends ComponentProps<"div"> {}

export default function SeriesSidePanel(props: SeriesSidePanelProps) {
    const {

    } = props;
    const dispatch = useAppDispatch();
    const series = useAppSelector(selectSeries);
    const [selected, setSelected] = useState<number>();

    useEffect(() => {
        dispatch(fetchSeries());
    })

    return (
        <ul className="w-[220px]">
            {series.map((s, i) => (
                <li key={i} className="border-b-2">
                    <SeriesPanelItem 
                        item={s} 
                        selected={i === selected}
                        onClick={() => setSelected(i)}
                    />
                </li>
            ))}
        </ul>
    )
}