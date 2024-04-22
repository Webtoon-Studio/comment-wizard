import { useEffect, useMemo, useRef, useState } from "react";
import {
  INCOM_ONMOUNTED_EVENT_NAME,
  POSTS_FETCHED_EVENT_NAME,
} from "../global";
import { Post } from "../webtoon";
import PostItem from "./components/PostItem";

export default function Main() {
  const ref = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  // OnMount
  //     - Set up event listner to communicate with service worker
  useEffect(() => {
    console.log("setting event listener in main");
    window.addEventListener(POSTS_FETCHED_EVENT_NAME, ((
      event: CustomEvent<Post[]>
    ) => {
      console.log("event received: ", event);
      const fetchedPosts = event.detail;
      const newPosts: Post[] = [...(posts || [])];
      fetchedPosts.forEach((post) => {
        if (!newPosts.find((p) => p.id === post.id)) {
          newPosts.push(post);
        }
      });
      setPosts(newPosts);
    }) as EventListener);
    window.dispatchEvent(new CustomEvent(INCOM_ONMOUNTED_EVENT_NAME));
  }, []);

  const visiblePosts: Post[] = useMemo(() => {
    return posts?.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) || [];
  }, [posts]);

  return (
    <div ref={ref}>
      <ul className="">
        {visiblePosts.map((p, i) => (
          <li key={i} className="py-[30px] border-b-2 last-child:border-b-0">
            <PostItem post={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
