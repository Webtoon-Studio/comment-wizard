import { CountContext } from "@popup/context/CountProvider";
import { ITitle } from "@shared/title";
import { useContext, useMemo } from "react";

interface TitleItemProps {
    title: ITitle;
    onClick?: (title: ITitle) => void;
}

export default function TitleItem(props: TitleItemProps) {
    const { title, onClick } = props;
    const { counts } = useContext(CountContext);

    const count = useMemo(() => {
        const count = counts.find(c => c.titleId === title.id);
        return count?.totalNewCount ?? null;
    }, [counts, title.id]);

    return (
        <div className="relative w-full select-none">
            <div className="absolute z-[2] right-2 top-2">
                <div className="min-w-6 h-6 px-1 flex justify-center items-center rounded-full bg-red-500">
                    <span className="text-white text-xs">
                        {count === null ? ".." : count}
                    </span>
                </div>
            </div>
            <div className="w-full flex rounded border-[1px]">
                <div className="flex-shrink-0 w-16 h-16 rounded overflow-clip">
                    <img 
                        className="aspect-square object-cover"
                        src={title.thumbnailUrl.replace("webtoon-phinf", "swebtoon-phinf")} 
                        alt={`${title.subject} thumbnail`} 
                    />
                </div>
                <div className="flex items-center px-2 py-1 line-clamp-2">
                    <span className="w-full text-sm">
                        {title.subject}
                    </span>
                </div>
            </div>
        </div>
    );
}