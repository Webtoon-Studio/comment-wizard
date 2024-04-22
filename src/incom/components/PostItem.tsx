import { Post } from "@root/src/webtoon";

interface PostItemProps {
  post: Post;
}

export default function PostItem(props: PostItemProps) {
  const { post } = props;
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
        <div className="my-2 text-lg">
          <p>{post.body}</p>
        </div>
        <div>
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
      </div>
    </div>
  );
}
