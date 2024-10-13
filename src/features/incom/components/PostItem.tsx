import Button from "@incom/components/Button";
import DeleteIcon from "@incom/components/DeleteIcon";
import DislikeIcon from "@incom/components/DislikeIcon";
import LikeIcon from "@incom/components/LikeIcon";
import type { Post } from "@shared/post";
import { useId } from "react";

interface PostItemProps {
	post: Post;
}

export default function PostItem(props: PostItemProps) {
	const { post } = props;
	const id = useId();
	return (
		<div>
			<div>
				<div>
					<div className="text-xl text-gray-800">
						{post.username} on Episode {post.episode}
					</div>
					<span className="float-right">{post.isNew ? "NEW" : ""}</span>
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
						<Button id={`${id}delete-button`}>
							<DeleteIcon />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
