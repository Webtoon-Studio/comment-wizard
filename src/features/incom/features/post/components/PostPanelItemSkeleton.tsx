import DotIcon from "@incom/features/components/DotIcon";

export default function PostPanelItemSkeleton() {
    return (
        <div
            className={[
                "w-full flex flex-col gap-2 py-2 select-none",
            ].join(" ")}
        >
             <div className="w-full px-4 flex items-center gap-2">
                <div className="inline-block h-4 w-[16ch] bg-gray-400 animate-pulse"/>
                <DotIcon className="text-gray-400"/>
                <div className="inline-block h-4 w-[10ch] bg-gray-400 animate-pulse" />
             </div>
             <div className="px-4">
                <div className="inline-block h-8 w-full bg-gray-400 animate-pulse"/>
            </div>
            <div className="w-full h-[33px]"/>
        </div>
    )
}