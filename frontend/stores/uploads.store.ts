import { create } from "zustand";

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

interface UploadsStore {
    uploads: Upload[];
    setUploads: (uploads: Upload[]) => void;
    addUpload: (upload: Upload) => void;
    removeUpload: (fileName: string) => void;
}

export const useUploadsStore = create<UploadsStore>((set) => ({
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
