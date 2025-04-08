import { IS_DEV } from "@shared/global";
import { STORAGE_TITLES_NAME, loadTitles } from "@shared/storage";
import { ITitle, Title } from "@shared/title";
import { useEffect, useState } from "react";

async function loadTitle(): Promise<ITitle[]> {
    console.log("Loading Title");
    if (IS_DEV || !chrome.storage) {
        const storedItem = localStorage.getItem(STORAGE_TITLES_NAME);
        if (storedItem) {
            const importedTitle = JSON.parse(storedItem);
            if (
                Array.isArray(importedTitle) && 
                importedTitle.every((v) => Title.isTitle(v))
            ) {
                return importedTitle;
            }
        }
        const { mockTitles }  = await import("@src/mock");
        return Array.from(new Array(10 + Math.ceil(Math.random() * 10))).map(() => mockTitles());
    } else {
        return await loadTitles() ?? [];
    }
}

export function useTitle() {
    const [titles, setTitles] = useState<ITitle[]>([]);

    useEffect(() => {
        fetchTitles();
    }, []);

    const fetchTitles = () => {
        loadTitle().then((loaded) => setTitles(loaded));
    }
    
    return [titles, fetchTitles] as const;
}