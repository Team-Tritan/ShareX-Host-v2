import type { UserState } from "@/typings";
import { getCookie, setCookie } from "@/lib/utils";
import { create } from "zustand";

export const useUser = create<UserState>((set) => ({
  apiToken: getCookie("api_key"),
  setToken: (token: string) => {
    setCookie("api_key", token);
    set({ apiToken: token });
  },
  displayName: getCookie("display_name"),
  setDisplayName: (name: string) => {
    setCookie("display_name", name);
    set({ displayName: name });
  },
  domain: getCookie("domain"),
  setDomain: (domain: string) => {
    setCookie("domain", domain);
    set({ domain });
  },

  loading: true,
  setLoading: (loading) => set({ loading }),

  urls: [],
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

  uploads: [],
  setUploads: (uploads) => set({ uploads }),
  addUpload: (upload) =>
    set((state) => ({
      uploads: [...state.uploads, upload],
    })),
  removeUpload: (fileName) =>
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.FileName !== fileName),
    })),
}));
