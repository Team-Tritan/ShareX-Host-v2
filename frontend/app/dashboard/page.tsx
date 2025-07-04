/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Upload, ApiResponse, UserState } from "@/typings";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { formatFileSize } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, CopyIcon, Eye, Trash2, Search } from "lucide-react";
import { toast } from "react-hot-toast";

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
  fileName: string,
  removeUpload: (FileName: string) => void,
  user: UserState
): Promise<void> => {
  try {
    const response = await fetch(`/api/delete-upload/${fileName}`, {
      headers: {
        key: apiToken,
      },
      method: "DELETE",
    });

    if (response.ok) {
      removeUpload(fileName);
      toast.success("File deleted successfully!");
      fetchImages(user.apiToken, user.setUploads, user.setLoading);
    } else {
      const errorData = await response.json();

      toast.error(
        "Failed to delete image: " + (errorData.message || "Unknown error")
      );
    }
  } catch {
    toast.error("Error deleting image");
  }
};

const Dashboard: React.FC = () => {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  if (!user.apiToken) return <Unauthenticated />;

  const filteredUploads = user.uploads.filter((upload) =>
    upload.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFilesUploaded: number = user.uploads.length;
  const totalViews: number = user.uploads.reduce(
    (acc, image) => acc + image.metadata.views,
    0
  );
  const totalStorageUsed: number = user.uploads.reduce(
    (acc, image) => acc + image.metadata.fileSize,
    0
  );

  useEffect(() => {
    fetchImages(user.apiToken, user.setUploads, user.setLoading);

    const intervalId = setInterval(
      () => fetchImages(user.apiToken, user.setUploads, user.setLoading),
      10000
    );

    return () => clearInterval(intervalId);
  }, [user.apiToken, user.setUploads, user.setLoading]);

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
        <motion.h1
          className="mb-2 text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome, {user.displayName}!
        </motion.h1>
        <motion.div
          className="text-gray-400 text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          You can view and manage your uploads below.
        </motion.div>

        <p className="text-gray-400 text-md mb-2 font-semibold">Your Stats:</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
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

        {user.uploads.length > 6 && (
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/3 p-2 pl-10 rounded bg-[#121114] text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        )}

        <p className="text-gray-400 text-md mb-2 font-semibold">
          Your Uploads:
        </p>

        {user.loading ? (
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
            {filteredUploads.length === 0 ? (
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
              filteredUploads.map((image: Upload) => (
                <div
                  key={image.fileName}
                  className="relative overflow-hidden rounded-lg bg-[#121114] group shadow-2xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-105"
                >
                  <img
                    src={`https://s3.tritan.gg/images/${image.fileName}`}
                    alt={image.fileName}
                    className="h-48 w-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300">
                      <CopyIcon
                        className="h-4 w-4"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://${user.domain}/i/${image.fileName.split(".")
                              .slice(0, -1)
                              .join(".")}`
                          );
                          toast.success("Copied URL to clipboard!");
                        }}
                      />
                    </button>

                    <Link
                      href={`https://${user.domain}/i/${image.fileName.split(".")
                        .slice(0, -1)
                        .join(".")}`}
                      prefetch={false}
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
                          `${image.fileName.split(".").slice(0, -1).join(".")}`,
                          user.removeUpload,
                          user
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-300">
                      <Link
                        href={`https:///i/${image.fileName.split(".")
                          .slice(0, -1)
                          .join(".")}`}
                        prefetch={false}
                      >
                        {image.fileName}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      Uploaded on{" "}
                      {new Date(image.metadata.uploadDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-pink-400">
                        {image.metadata.views}
                      </span>{" "}
                      Views
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-green-400">
                        {formatFileSize(image.metadata.fileSize)}
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
