import { useCallback, useContext, useMemo, useRef, useState } from "react";
import CommentPagination from "@incom/features/Comments/components/CommentPagination";
import { Post, PostIdType } from "@root/src/post";
import CommentItem from "@incom/features/Comments/components/CommentItem";
import CommentFilterSelect from "@incom/features/Comments/components/CommentFilterSelect";
import { CommentContextProps, commentContext } from "@incom/features/Comments/CommentProvider";
import Loading from "@incom/common/components/Loading";

interface CommentListProps {
}

export default function CommentList(props: CommentListProps) {
    const {isLoading, comments: posts, updateComments} = useContext(commentContext);
    const rootRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(0);
	const [perPage, setPerPage] = useState(20);
    const [titleIdFilter, setTitleIdFilter] = useState("");
    const [episodeFilter, setEpisodeFilter] = useState("");

    const titles = useMemo(() => {
        return posts ? (
            Array.from(new Set(
                posts
                .map(p => p.webtoonId as string)
                .sort((a,b) => parseInt(a) - parseInt(b))
            ))
        ) : []
    }, [posts]);

    const episodes = useMemo(() => {
        if (posts) {
            let eps = posts
                .filter(p => titleIdFilter === "" ? true : p.webtoonId === titleIdFilter)
                .map(p => p.episode || -1)
                .sort((a,b) => a - b)
                .filter(ep => ep >= 0)
                .map(ep => ep.toString());
            return Array.from(new Set(eps));
        } else {
            return [];
        }
    }, [posts, titleIdFilter]);

	const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        headerRef.current?.scrollIntoView();
	}, [headerRef.current]);

    const handlePostMarkedRead = (postId: PostIdType) => {
        if (posts && updateComments) {
            updateComments(posts);
        }
    }

    const handleTitleIdFilterChange = (newValue: string) => {
        setTitleIdFilter(newValue);
        setEpisodeFilter("");
    }

    const handleEpisodeFilterChange = (newValue: string) => {
        setEpisodeFilter(newValue);
    }

	const visiblePosts: Post[] = useMemo(() => {
		return (
			posts
                ?.filter((p) => titleIdFilter === "" ? true : p.webtoonId === titleIdFilter)
                ?.filter((p) => episodeFilter === "" ? true : p.episode?.toString() === episodeFilter)
				?.slice(page * perPage, (page + 1) * perPage)
				?.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) || []
		);
	}, [posts, titleIdFilter, episodeFilter, page, perPage]);
    
    return !isLoading && posts ? (
        <div ref={rootRef}>
            <div ref={headerRef} className="absolute top-[-86px] h-[76px] left-[-48px] right-0 flex items-center">
                <div className="flex items-center gap-4">
                    <CommentFilterSelect 
                        label="Series"
                        items={titles}
                        value={titleIdFilter}
                        onChange={handleTitleIdFilterChange}
                    />
                    <CommentFilterSelect 
                        label="Episode"
                        width={10}
                        items={episodes}
                        value={episodeFilter}
                        onChange={handleEpisodeFilterChange}
                    />
                </div>
            </div>
            <ul className="">
                {visiblePosts.map((p, i) => (
                    <li
                        key={i}
                        className="py-[30px] border-b-2 last-child:border-b-0"
                    >
                        <CommentItem post={p} onMarkRead={handlePostMarkedRead}/>
                    </li>
                ))}
            </ul>
            <div>
                <div className="flex justify-center">
                    {posts ? (
                        <CommentPagination
                            count={visiblePosts.length}
                            page={page}
                            perPage={perPage}
                            onPageChange={handlePageChange}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    ) : (
        <div className="w-full min-h-[50vh] flex justify-center items-center pb-[10px]">
            <Loading />
        </div>
    );
}