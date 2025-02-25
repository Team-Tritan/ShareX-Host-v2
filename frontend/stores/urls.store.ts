import { create } from "zustand";

interface Url {
    Key: string;
    URL: string;
    CreatedAt: string;
    IP: string;
    Slug: string;
    Clicks: number;
}

interface UrlsStore {
    urls: Url[];
    loading: boolean;
    setUrls: (urls: Url[]) => void;
    addUrl: (url: Url) => void;
    removeUrl: (slug: string) => void;
    updateUrl: (key: string, newSlug: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useUrls = create<UrlsStore>((set) => ({
    urls: [],
    loading: true,
    setUrls: (urls) => set({ urls }),
    addUrl: (url) =>
        set((state) => ({
            urls: [...state.urls, url],
        })),
    removeUrl: (slug) =>
        set((state) => ({
            urls: state.urls.filter((url) => url.Slug !== slug),
        })),
    updateUrl: (key, newSlug) =>
        set((state) => ({
            urls: state.urls.map((url) =>
                url.Key === key ? { ...url, Slug: newSlug } : url
            ),
        })),
    setLoading: (loading) => set({ loading }),
}));
