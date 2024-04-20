import { IEpicom } from "@root/src/incom/interfaces";
import { useId } from "react";

interface PostProps {
  post: IEpicom;
}

export default function Post(props: PostProps) {
  const { post } = props;
  const id = useId();

  const authorBadgeIcon = post.createdBy.isPageOwner ? (
    <div id={`post-author-badge-${id}`}>#</div>
  ) : null;

  return (
    <div>
      <div id={`post-header-${id}`}>
        <div id={`post-info-${id}`}>
          <div id={`post-author-info-${id}`}>
            <span>{post.createdBy.name}</span>
            {authorBadgeIcon}
          </div>
          <span id={`post-date-info`}>
            {new Date(post.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div id={`post-body-${id}`}>
        <p>{post.body}</p>
      </div>
      <div id={`post-buttons-${id}`}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
