import { create } from "zustand";
import { getCookie, setCookie } from "@/lib/utils";

interface Url {
  Key: string;
  URL: string;
  CreatedAt: string;
  IP: string;
  Slug: string;
  Clicks: number;
}

interface Metadata {
  FileType: string;
  FileSize: number;
  UploadDate: string;
  Views: number;
}

interface Upload {
  _id: string;
  IP: string;
  Key: string;
  DisplayName: string;
  FileName: string;
  Metadata: Metadata;
}

interface UserState {
  apiToken: string;
  setToken: (token: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  domain: string;
  setDomain: (domain: string) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  urls: Url[];
  setUrls: (urls: Url[]) => void;
  addUrl: (url: Url) => void;
  removeUrl: (slug: string) => void;
  updateUrl: (key: string, newSlug: string) => void;

  uploads: Upload[];
  setUploads: (uploads: Upload[]) => void;
  addUpload: (upload: Upload) => void;
  removeUpload: (fileName: string) => void;
}

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
