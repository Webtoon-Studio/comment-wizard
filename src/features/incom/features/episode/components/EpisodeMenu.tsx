import { useAppDispatch, useAppSelector } from "@incom/common/hook";
import SearchBar, { type SearchCategory } from "@shared/components/SearchBar";
import type { ChangeEvent } from "react";
import { type EpisodeItem } from "@shared/global";
import { setFilter } from "@incom/features/episode/slice";


interface EpisodeMenuProps {}

export default function EpisodeMenu(props: EpisodeMenuProps) {
    // const { } = props;

    const dispatch = useAppDispatch();
    const { current } = useAppSelector(state => state.title);
    
    const categories: SearchCategory<keyof EpisodeItem>[] = [
        {
            key: "index",
            label: "No.",
            pattern: "([1-9][0-9]*)*",
            placeholder: "Search by the episode number"
        },
        {
            key: "title",
            label: "Title",
            placeholder: "Search by the episode title"
        }
    ]

    const handleSearchChange = function(_event: ChangeEvent<HTMLInputElement> | null, key: keyof EpisodeItem | undefined, value: string) {
        if (key === undefined || value.length === 0) {
            dispatch(setFilter(null));
            return;
        }
        dispatch(setFilter({
            key,
            value
        }));
    };

    return (
        <div className="w-full p-2 flex">
            <div className="flex-auto">
                <SearchBar 
                    categories={categories}
                    disabled={current === null}
                    onChange={handleSearchChange}
                />
            </div>
        </div>
    )
}