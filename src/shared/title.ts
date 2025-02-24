export interface TitleAuthor {
    nickname: string;
}

interface TitleExtra {
    episodeListPath: string;
    restTerminationStatus: string; // e.g. SERIES
    unsuitableForChildren: boolean;
};

export interface Title {
    authors: TitleAuthor[];
    extra: TitleExtra;
    genres: string[]; // e.g. DRAMA
    grade: string; // e.g. CHALLENGE
    id: `${number}`;
    recentEpisodeRegisteredAt: number;
    representGenre: string; // e.g. DRAMA
    shareThumbnailUrl: string;
    subject: string;
    thumbnailUrl: string;
    titleRegisteredAt: number;
};
