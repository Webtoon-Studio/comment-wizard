import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import SeriesMenu from "@incom/features/series/components/SeriesMenu";
import SeriesPanelItem from "@incom/features/series/components/SeriesPanelItem";
import { fetchSeries, setCurrentSeries } from "@incom/features/series/slice";
import type { SeriesItem } from "@shared/global";
import { useEffect, useState, type ComponentProps } from "react";

interface SeriesSidePanelProps extends ComponentProps<"div"> {}

export default function SeriesSidePanel(props: SeriesSidePanelProps) {
    const {

    } = props;
    const dispatch = useAppDispatch();
    const { status, seriesItems: series, current } = useAppSelector(state => state.series);

    useEffect(() => {
        dispatch(fetchSeries());
    }, [])

    const handleSelect = function(item: SeriesItem) {
        if (item === current) {
            dispatch(setCurrentSeries(null));
        } else {
            dispatch(setCurrentSeries(item));
        }
    }

    return (
        <div className="h-full bg-gray-100">
            <div className="border-b-2">
                <SeriesMenu />
            </div>
            <ul className="w-[240px]">
                {status === 'idle' ? series.map((s, i) => (
                    <li key={i} className="p-2">
                        <SeriesPanelItem 
                            item={s}
                            selected={s.titleId === current?.titleId}
                            onClick={() => handleSelect(s)}
                        />
                    </li>
                )) : (
                    <li>
                        <SeriesPanelItem />
                    </li>
                )}
            </ul>
        </div>
    )
}