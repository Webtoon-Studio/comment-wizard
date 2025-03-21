import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import { setCurrentEpisode } from "@incom/features/episode/slice";
import TitleMenu from "@incom/features/title/components/TitleMenu";
import TitlePanelItem from "@incom/features/title/components/TitlePanelItem";
import { fetchTitles, setCurrentTitle } from "@incom/features/title/slice";
import type { SeriesItem } from "@shared/global";
import type { Title } from "@shared/title";
import { useEffect, useState, type ComponentProps } from "react";

interface TitleSidePanelProps extends ComponentProps<"div"> {}

export default function TitleSidePanel(props: TitleSidePanelProps) {
    const {

    } = props;
    const dispatch = useAppDispatch();
    const { status, items: titles, current } = useAppSelector(state => state.title);

    useEffect(() => {
        dispatch(fetchTitles());
    }, [])

    const handleSelect = function(item: Title) {
        if (item === current) {
            dispatch(setCurrentTitle(null));
        } else {
            dispatch(setCurrentTitle(item));
        }
        dispatch(setCurrentEpisode(null));
    }

    return (
        <div className="h-full bg-gray-100">
            <div className="border-b-2">
                <TitleMenu />
            </div>
            <ul className="w-[200px]">
                {status === 'idle' ? titles.map((s, i) => (
                    <li key={i} className="p-2">
                        <TitlePanelItem 
                            item={s}
                            selected={s.id === current?.id}
                            onClick={() => handleSelect(s)}
                        />
                    </li>
                )) : (
                    <li>
                        <TitlePanelItem />
                    </li>
                )}
            </ul>
        </div>
    )
}