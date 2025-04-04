import { useAppDispatch } from "@incom/common/hook";
import Button from "@incom/features/components/Button";
import DislikeIcon from "@incom/features/components/DislikeIcon";
import DotIcon from "@incom/features/components/DotIcon";
import LikeIcon from "@incom/features/components/LikeIcon";
import PostPanelItemMenu from "@incom/features/post/components/PostPanelItemMenu";
import { setPostRead, setPostUnread, setReplyRead, setReplyUnread } from "@incom/features/post/slice";
import type { Post } from "@shared/post";
import { useCallback, useRef, useState, type MouseEvent } from "react";

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

const ReplyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="-4 -4 16 16" x="1126" y="973">
        <path d="M1 .5v7h7" stroke="#A6A6A6"/>
    </svg>
)

const UpArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="15" fill="none" viewBox="-4 -4 19 15" x="899" y="905">
        <path d="M10.5 6.5l-5-5-5 5" stroke="#3C3C3C" stroke-width="1.2"/>
    </svg>
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
    item: Post;
    isReply?: boolean;
}

export default function PostPanelItem(props: PostPanelItemProps) {
    const {
        item,
        isReply = false
    } = props;
    const dispatch = useAppDispatch();
    const rootRef = useRef<HTMLDivElement>(null);
    const [openReplies, setOpenReplies] = useState(false);

    const locale = navigator.languages ? navigator.languages[0] : navigator.language;

    const createdDateString = new Date(item.createdAt).toLocaleDateString(locale, {month: "short", day: "numeric", year:"numeric"});

    const handleDoubleClick = useCallback(function(event: MouseEvent) {
        event.stopPropagation();
        if (isReply) {
            if (item.isNew) {
                dispatch(setReplyRead({postId: item.rootId, replyId: item.id}));
            } else {
                dispatch(setReplyUnread({postId: item.rootId, replyId: item.id}));
            }
        } else {
            if (item.isNew) {
                dispatch(setPostRead({postId: item.id}));
            } else {
                dispatch(setPostUnread({postId: item.id}));
            }
        }
    }, [item.isNew]);

    const stopPropagation = function(event: MouseEvent) {
        event.stopPropagation();
    }

    const handleRepliesClick = function(event: MouseEvent) {
        event.stopPropagation();
        if (openReplies) setOpenReplies(false);
        else setOpenReplies(true);
    }

    const handleRepliesCollapse = function(event: MouseEvent) {
        event.stopPropagation();
        setOpenReplies(false);
        // rootRef.current?.scrollIntoView({
        //     behavior: "smooth",
        //     block: "start",
        //     inline: "nearest"
        // });
    }

    const handleMarkReadClick = function(event: MouseEvent) {
        if (isReply) {
            dispatch(setReplyRead({postId: item.rootId, replyId: item.id}));
        } else {
            dispatch(setPostRead({postId: item.id}));
        }
    }

    const handleMarkUnreadClick = function(event: MouseEvent) {
        if (isReply) {
            dispatch(setReplyUnread({postId: item.rootId, replyId: item.id}));
        } else {
            dispatch(setPostUnread({postId: item.id}));
        }
    }

    return (
        <div
            ref={rootRef}
            className={[
                "w-full flex flex-col gap-2 py-2 select-none",
                isReply ? "pl-4" : "",
            ].join(" ")}
            onDoubleClick={handleDoubleClick}
        >
            <div className="w-full px-4 flex items-center gap-2">
                <div className="flex items-center gap-1">
                    {isReply ? (
                        <ReplyIcon />
                    ): null}
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
                <DotIcon className="text-gray-400"/>
                <div className="text-gray-500">
                    <span>
                        {createdDateString}
                    </span>
                    {item.createdAt < item.updatedAt ? (
                        <span className="ml-[1ch]">(edited)</span>
                    ): null}
                </div>
                {item.isNew ? (
                    <div className="flex-auto *:float-right">
                        <NewDotMark />
                    </div>
                ) : null}
            </div>
            <div className="px-4">
                {!item.isDeleted ? (
                    <p>
                        {item.content}
                    </p>
                ) : (
                    <p className="text-gray-500">This comment has been deleted.</p>
                )}
            </div>
            <div className="w-full px-4 flex justify-end items-center gap-2">
                {item.replyCount > 0 ? (
                    <div 
                        className={[
                            "px-2 py-1 flex justify-center items-center gap-2 border-[1px] cursor-pointer",
                            !item.replies.every(r => !r.isNew) ? "shadow-[0_0_2px_rgb(0,220,100)]" : ""
                        ].join(" ")}
                        onClick={handleRepliesClick}
                        onDoubleClick={stopPropagation}
                    >
                        <span>{item.replyCount > 1 ? "Replies" : "Reply"} {item.replyCount}</span>
                    </div>
                ) : null}
                <PostPanelItemMenu>
                    {item.isNew ? (
                        <Button size="sm" className="text-nowrap" onClick={handleMarkReadClick}>
                            Mark as Read
                        </Button>
                    ) : (
                        <Button size="sm" className="text-nowrap" onClick={handleMarkUnreadClick}>
                            Mark as Unread
                        </Button>
                    )}
                </PostPanelItemMenu>
                <div 
                    className="px-2 py-1 flex justify-center items-center border-[1px]"
                    onDoubleClick={stopPropagation}
                >
                    <LikeIcon />
                    <span className="text-sm">
                        {item.likes}
                    </span>
                </div>
                <div 
                    className="px-2 py-1 flex justify-center items-center border-[1px]"
                    onDoubleClick={stopPropagation}
                >
                    <DislikeIcon />
                    <span className="text-sm">
                        {item.dislikes}
                    </span>
                </div>
            </div>
            {item.replyCount > 0 ? (
                <div 
                    className={[
                        "w-full bg-gray-100 overflow-clip",
                        openReplies ? "h-auto" : "h-0"
                    ].join(" ")}
                >
                    <ul>
                        {item.replies.map((reply, i) => (
                            <li key={i} className="border-b-[1px] snap-start">
                                <PostPanelItem item={reply} isReply/>
                            </li>
                        ))}
                        <li className="w-full">
                            <div 
                                className="w-full py-2 flex justify-center items-center gap-1 hover:bg-gray-200 cursor-pointer"
                                onClick={handleRepliesCollapse}
                            >
                                <UpArrowIcon />
                                <span>Collapse Replies</span>
                            </div>
                        </li>
                    </ul>
                </div>
            ) : null}
        </div>
    )
}