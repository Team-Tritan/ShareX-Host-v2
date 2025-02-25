/* eslint-disable @next/next/no-img-element */
"use client";

import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { useUser } from "@/stores/session.store";
import { useUploads } from "@/stores/uploads.store";
import { formatFileSize } from "@/lib/utils";
import { AlertCircle, CopyIcon, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

interface ApiResponse {
  uploads: Upload[];
}

const fetchImages = async (
  apiToken: string,
  setUploads: (uploads: Upload[]) => void,
  setLoading: (loading: boolean) => void
): Promise<void> => {
  try {
    const response = await fetch("/api/uploads", {
      headers: {
        key: apiToken,
      },
      method: "GET",
    });

    const data: ApiResponse = await response.json();
    setUploads(data.uploads || []);
  } catch (error) {
    console.error("Error fetching images:", error);
    toast.error("Failed to fetch images");
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (
  apiToken: string,
  FileName: string,
  removeUpload: (FileName: string) => void
): Promise<void> => {
  try {
    const response = await fetch(`/api/delete-upload/${FileName}`, {
      headers: {
        key: apiToken,
      },
      method: "DELETE",
    });

    if (response.ok) {
      removeUpload(FileName);
      toast.success("File deleted successfully!");
    } else {
      const errorData = await response.json();
      console.error("Failed to delete image", errorData);
      toast.error(
        "Failed to delete image: " + (errorData.message || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    toast.error("Error deleting image");
  }
};

const Dashboard: React.FC = () => {
  const { uploads, setUploads, removeUpload } = useUploads();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const user = useUser();

  if (!user.apiToken) return <Unauthenticated />;

  const totalStorageUsed: number = uploads.reduce(
    (acc, image) => acc + image.Metadata.FileSize,
    0
  );
  const totalFilesUploaded: number = uploads.length;
  const totalViews: number = uploads.reduce(
    (acc, image) => acc + image.Metadata.Views,
    0
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchImages(user.apiToken, setUploads, setLoading);
    const intervalId = setInterval(
      () => fetchImages(user.apiToken, setUploads, setLoading),
      10000
    );
    return () => clearInterval(intervalId);
  }, [user.apiToken, setUploads, setLoading]);

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#0d0c0e] text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 overflow-auto p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"
          }`}
      >
        <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Welcome, {user.displayName}!
        </h1>
        <div className="text-gray-400 mb-12 text-lg">
          You can view and manage your uploads below.
        </div>

        <p className="text-gray-400 text-md mb-2 font-semibold">Your Stats:</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="p-4 bg-purple-500 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white">
              Total Storage Used
            </h3>
            <p className="text-2xl font-bold text-white">
              {formatFileSize(totalStorageUsed)}
            </p>
          </div>
          <div className="p-4 bg-pink-500 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white">
              Total Files Uploaded
            </h3>
            <p className="text-2xl font-bold text-white">
              {totalFilesUploaded}
            </p>
          </div>
          <div className="p-4 bg-green-500 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white">Total Views</h3>
            <p className="text-2xl font-bold text-white">{totalViews}</p>
          </div>
        </div>

        <p className="text-gray-400 text-md mb-2 font-semibold">
          Your Uploads:
        </p>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg bg-[#121114] animate-pulse"
              >
                <div className="h-48 w-full bg-[#121114]"></div>
                <div className="p-4">
                  <div className="h-4 bg-zinc-800 mb-2"></div>
                  <div className="h-4 bg-zinc-800 mb-2"></div>
                  <div className="h-4 bg-zinc-800"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {uploads.length === 0 ? (
              <>
                <div className="col-span-full flex items-center justify-center text-gray-400 rounded-lg">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <div className="col-span-full text-gray-400 rounded-lg">
                    You do not have any uploads.
                  </div>
                </div>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg bg-[#121114] animate-pulse"
                  >
                    <div className="h-48 w-full bg-[#121114]"></div>
                    <div className="p-4">
                      <div className="h-4 bg-zinc-800 mb-2"></div>
                      <div className="h-4 bg-zinc-800 mb-2"></div>
                      <div className="h-4 bg-zinc-800"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              uploads.map((image: Upload) => (
                <div
                  key={image.FileName}
                  className="relative overflow-hidden rounded-lg bg-[#121114] group shadow-2xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-105"
                >
                  <img
                    src={`https://s3.tritan.gg/images/${image.FileName}`}
                    alt={image.FileName}
                    className="h-48 w-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300">
                      <CopyIcon
                        className="h-4 w-4"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${user.domain}/i/${image.FileName.split(".")
                              .slice(0, -1)
                              .join(".")}`
                          );
                          toast.success("Copied URL to clipboard!");
                        }}
                      />
                    </button>

                    <Link
                      href={`${user.domain}/i/${image.FileName.split(".")
                        .slice(0, -1)
                        .join(".")}`}
                    >
                      <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>

                    <button
                      className="flex items-center rounded bg-pink-500 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-300"
                      onClick={() =>
                        handleDelete(
                          user.apiToken,
                          `${image.FileName.split(".").slice(0, -1).join(".")}`,
                          removeUpload
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-300">
                      <Link
                        href={`/i/${image.FileName.split(".")
                          .slice(0, -1)
                          .join(".")}`}
                      >
                        {image.FileName}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      Uploaded on{" "}
                      {new Date(image.Metadata.UploadDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-pink-400">
                        {image.Metadata.Views}
                      </span>{" "}
                      Views
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-green-400">
                        {formatFileSize(image.Metadata.FileSize)}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
