import { useEffect, useMemo, useRef, useState } from "react";
import {
  EpisodeNewestPost,
  INCOM_ONMOUNTED_EVENT_NAME,
  isPostIdNewer,
  POSTS_FETCHED_EVENT_NAME,
} from "../global";
import { Post } from "../webtoon";
import PostItem from "./components/PostItem";
import { mockPostData } from "@root/src/incom/service/data";

interface PaginationProps {
  count: number;
  page: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
}

function Pagination(props: PaginationProps) {
  const { count, page, perPage, onPageChange } = props;

  if (perPage === 0) {
    return null;
  }

  const max = Math.ceil(count / perPage);
  return (
    <div className="h-16 flex items-center gap-2 select-none">
      <div
        className="cursor-pointer h-8 aspect-square flex justify-center items-center"
        onClick={() => onPageChange(0)}
      >
        {"<<"}
      </div>
      {Array.from(Array(max)).map((_, i) => (
        <div
          className={[
            "cursor-pointer h-8 aspect-square rounded-full bg-gray-100 text-sm flex justify-center items-center",
            "hover:text-webtoon",
            i === page ? "font-bold text-webtoon" : "text-black",
            i < max - 9 && page >= 5 && i <= page - 5 ? "hidden" : "",
            i >= 9 && i > page + 4 ? "hidden" : "",
          ].join(" ")}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </div>
      ))}
      <div
        className="cursor-pointer h-8 aspect-square flex justify-center items-center"
        onClick={() => onPageChange(max - 1)}
      >
        {">>"}
      </div>
    </div>
  );
}

export default function Main() {
  const ref = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [newest, setNewest] = useState<EpisodeNewestPost[] | null>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);

  // OnMount
  //     - Set up event listner to communicate with service worker
  useEffect(() => {
    const isProd = (() => {
      try {
        return import.meta.env.PROD;
      } catch {
        return true;
      }
    })(); //process.env.NODE_ENV !== "development"
    console.log("Is Prod?", isProd);
    if (isProd) {
      console.log("setting event listener in main");
      window.addEventListener(POSTS_FETCHED_EVENT_NAME, ((
        event: CustomEvent<{ posts: Post[]; newest: EpisodeNewestPost[] }>
      ) => {
        console.log("event received: ", event);
        const fetchedPosts = event.detail.posts;
        const newPosts: Post[] = [...(posts || [])];
        fetchedPosts.forEach((post) => {
          if (!newPosts.find((p) => p.id === post.id)) {
            newPosts.push(post);
          }
        });
        setPosts(newPosts);
        setNewest(event.detail.newest as EpisodeNewestPost[]);
      }) as EventListener);
      window.dispatchEvent(new CustomEvent(INCOM_ONMOUNTED_EVENT_NAME));
    } else {
      setPosts(Array.from(new Array(5000)).map(() => mockPostData()));
    }
  }, []);

  const handlePageChange = function (newPage: number) {
    setPage(newPage);
  };

  const visiblePosts: Post[] = useMemo(() => {
    return (
      posts
        ?.slice(page * perPage, (page + 1) * perPage)
        ?.map((p) => {
          const compared = newest?.find(
            (item) => item.episode === p.episode && item.titleId === p.webtoonId
          );
          p.isNew =
            p.id && compared
              ? isPostIdNewer(p.id, compared.newestPostId)
              : false;
          return p;
        })
        ?.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) || []
    );
  }, [posts, newest, page, perPage]);

  return (
    <div ref={ref}>
      {/* <div className="absolute left-0 top-[-4rem] w-[300px] h-[3rem] px-4 py-2 border-2 rounded-full bg-[#8c8c8c] text-white font-medium">
        <div className="h-full flex items-center">
          <span>Filter</span>

        </div>
      </div> */}
      <ul className="">
        {visiblePosts.map((p, i) => (
          <li key={i} className="py-[30px] border-b-2 last-child:border-b-0">
            <PostItem post={p} />
          </li>
        ))}
      </ul>
      <div>
        <div className="flex justify-center">
          {posts ? (
            <Pagination
              count={posts.length}
              page={page}
              perPage={perPage}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
