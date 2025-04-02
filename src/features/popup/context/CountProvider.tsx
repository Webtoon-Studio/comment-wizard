import { loadPostCounts } from "@shared/storage";
import { PostCountType } from "@shared/post";
import { Component, ComponentProps, createContext, useEffect, useState } from "react";

interface CountContextProps {
    counts: PostCountType[];
    refresh: () => void;
}

export const CountContext = createContext<CountContextProps>({
    counts: [],
    refresh: () => {},
});

export default function CountProvider(props: ComponentProps<"div">) {
    const { children } = props;
    const [counts, setCounts] = useState<PostCountType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    
    const refresh = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const postCounts = await loadPostCounts();
            if (postCounts === null) {
                throw new Error("Failed to load post counts");
            }
            setCounts(postCounts);
        } catch (error) {
            console.error("Failed to fetch counter:", error);
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        refresh();
    });

    const countValue = {
        counts,
        refresh
    } satisfies CountContextProps;

    return (
        <CountContext.Provider value={countValue}>
            {children}
        </CountContext.Provider>
    );
}