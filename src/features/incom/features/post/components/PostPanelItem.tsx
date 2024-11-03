import PostPanelItemMenu from "@incom/features/post/components/PostPanelItemMenu";
import type { Post } from "@shared/post";
import { useState } from "react";

const DotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="0.875em" viewBox="0 0 24 24">
	    <circle fill="rgba(0,0,0,0.4)" r="6" cx="12" cy="12" />
    </svg>
);

const CreatorBadgeIcon = () => (
    <div className="relative inline-block w-[0.875rem] h-[0.875rem]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none">
            <path fill="rgb(0, 220, 100)" d="M0 1.47694V9.51378C0 9.7654 0.216 9.96417 0.4704 9.94682L5.8288 9.57767V11.5386L11.6536 9.11387C11.8632 9.02632 12 8.8236 12 8.59959V0.972119C12 0.724443 11.7904 0.527248 11.54 0.53908L0.42 1.0439C0.1848 1.05494 0 1.24504 0 1.47694Z" />
        </svg>
        <svg className="absolute top-[20%] left-[50%] w-[62.5%] translate-x-[-50%] drop-shadow-[0px_0px_10px_rgba(0,0,0,0.2)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 7" fill="none">
            <path fill="rgb(255,255,255)" d="M2.77035 6.07287L0.244751 3.5827L1.30555 2.53678L2.77035 3.98182L6.69515 0.115234L7.75515 1.16115L2.77035 6.07287Z" />
        </svg>
    </div>
)

const NewDotMark = () => (
    <div className="relative w-[1rem] h-[1rem]">
        <span className="absolute left-0 top-0">
            <circle fill="rgb(0, 220, 100)" r="6" cx="12" cy="12" />
        </span>
        <svg className="absolute left-0 top-0 drop-shadow-[0_0_2px_rgb(0,220,100)] animate-pulse" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" >
            <circle fill="rgb(0, 220, 100)" r="6" cx="12" cy="12" />
        </svg>
    </div>
);

interface PostPanelItemProps {
    item: Post
}

export default function PostPanelItem(props: PostPanelItemProps) {
    const {
        item
    } = props;

    const [replies, setReplies] = useState<Post[]>([]);

    const locale = navigator.languages ? navigator.languages[0] : navigator.language;

    const createdDateString = new Date(item.createdAt).toLocaleDateString(locale, {month: "short", day: "numeric", year:"numeric"});



    return (
        <div
            className={[
                "w-full flex flex-col gap-2 px-4 py-2 select-none",
                item.isNew ? "" : "opacity-50"
            ].join(" ")}
        >
            <div className="w-full flex items-center gap-2">
                <div className="flex items-center gap-1">
                    {item.isAnonymous ? (
                        <span>anonymous</span>
                    ) : (
                        <> 
                            <span className={item.isNew ? "font-bold" : ""}>
                                {item.username}
                            </span>
                            {item.isACreator ? <CreatorBadgeIcon /> : null}
                        </>
                    )}
                </div>
                <DotIcon />
                <div className="text-gray-500">
                    <span>
                        {createdDateString}
                    </span>
                    {item.createdAt < item.updatedAt ? (
                        <span className="ml-[1ch]">(edited)</span>
                    ): null}
                </div>
                <div className="flex-auto *:float-right">
                    <NewDotMark />
                </div>
            </div>
            <div>
                {!item.isDeleted ? (
                    <p>
                        {item.content}
                    </p>
                ) : (
                    <p className="text-gray-500">This comment has been deleted.</p>
                )}
            </div>
            <div className="w-full flex items-center gap-2">
                <PostPanelItemMenu />
            </div>
        </div>
    )
}