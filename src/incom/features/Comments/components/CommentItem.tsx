import MenuIcon from "@incom/common/components/MenuIcon";
import Button from "@incom/common/components/Button";
import DislikeIcon from "@incom/common/components/DislikeIcon";
import LikeIcon from "@incom/common/components/LikeIcon";
import type { Post, PostIdType } from "@root/src/post";
import { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import useOnScreen from "@incom/common/hooks/onScreen";

interface CommentItemProps {
	post: Post;
	onMarkRead?: (postId: PostIdType) => void;
}

export default function CommentItem(props: CommentItemProps) {
	const { post, onMarkRead } = props;
	const id = useId();
	const ref = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
	const isVisible = useOnScreen(ref);

	useEffect(() => {
		if (isVisible && post.isNew) {
			handleMarkRead();
		}
	}, [isVisible, post ? post.isNew : null])

	const handleMarkRead = useCallback(function() {
		post?.markAsRead();
		if (post.id && onMarkRead) {
			onMarkRead(post.id);
		}

		if (menuOpen) {
			setMenuOpen(false);
		}
	}, [post, menuOpen]);

	const newLabel = useMemo(
		() => post.isNew ? "NEW" : "", 
		[isVisible, post ? post.isNew : null]
	);

	return (
		<div ref={ref} className="relative">
			<div>
				<div className="flex justify-between">
                    <span className="absolute top-[-24px] text-webtoon">{newLabel}</span>
					<div className="">
                        <span className="text-xl text-gray-800">
                            {post.username} on Episode {post.episode}
                        </span>
					</div>
                    
                    <div className="relative flex flex-col items-center">
                        <Button 
                            id={`${id}menu-button`} 
                            variant="light" 
                            className="!p-0"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <MenuIcon />
                        </Button>
                        <div 
                            className={[
                                "absolute z-10 w-max flex flex-col bg-white border-[0.5px] border-solid border-[#d3d3d3] transition-[opacity_1s,visibility_0.5s] translate-y-[40px]",
                                menuOpen ? "visible opacity-100" : "invisible opacity-0"
                            ].join(" ")}
                        >
                            <div
								className="cursor-pointer hover:bg-gray-200 p-2" 
								onClick={() => handleMarkRead()}
							>
								<span>Mark as Read</span>
							</div>
                        </div>

                    </div>


				</div>
			</div>
			<div>
				<div className="h-[6rem] overflow-y-auto my-2 text-base">
					<p>{post.body}</p>
				</div>
				<div className="flex justify-between items-start">
					<div className="grow-1 shrink-0">
						{post.createdAt ? (
							<span className="text-sm text-gray-400">
								{new Date(post.createdAt).toLocaleDateString(undefined, {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</span>
						) : null}
					</div>
					<div className="w-full flex justify-end gap-2">
						<Button id={`${id}like-button`}>
							<div className="h-[23px] flex items-center">
								<LikeIcon />
								<span>{post.likes}</span>
							</div>
						</Button>
						<Button id={`${id}dislike-button`}>
							<div className="h-[23px] flex items-center">
								<DislikeIcon />
								<span>{post.dislikes}</span>
							</div>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
function useCallBack(arg0: () => void) {
	throw new Error("Function not implemented.");
}

