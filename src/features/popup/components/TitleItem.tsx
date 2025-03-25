import { ITitle } from "@shared/title";

interface TitleItemProps {
    title: ITitle;
    onClick?: (title: ITitle) => void;
}

export default function TitleItem(props: TitleItemProps) {
    const { title, onClick } = props;


    return (
        <div className="relative w-24 h-auto select-none">
            <div className="absolute z-[2] right-1 top-1">
                <div className="min-w-6 h-6 px-1 flex justify-center items-center rounded-full bg-red-500">
                    <span className="text-white text-xs">
                        {Math.ceil(Math.random() * 2000)}
                    </span>
                </div>
            </div>
            <div className="rounded border-[1px] overflow-clip">
                <div className="">
                    <img 
                        className="min-h-24 aspect-square object-cover"
                        src={title.thumbnailUrl} 
                        alt={`${title.subject} thumbnail`} 
                    />
                </div>
                <div className="px-2 py-1">
                    <p className="text-sm truncate">
                        {title.subject}
                    </p>
                </div>
            </div>
        </div>
    );
}