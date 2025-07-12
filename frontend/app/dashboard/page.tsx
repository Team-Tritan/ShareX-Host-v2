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
import { AlertCircle, CopyIcon, Eye, Trash2, Search, TrendingUp, HardDrive, FileImage, Filter } from "lucide-react";
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
    <div className="flex h-screen bg-gradient-to-br from-[#0d0c0e] via-[#1a1a1d] to-[#0d0c0e] text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 overflow-auto p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"
          }`}
      >
        {/* Header Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="mb-4 text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome back, {user.displayName}!
          </motion.h1>
          <motion.div
            className="text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Manage your uploads and track your statistics in one place.
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-300 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Your Statistics
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/20 p-6 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Total Storage Used
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {formatFileSize(totalStorageUsed)}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <HardDrive className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm border border-pink-500/20 p-6 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Total Files Uploaded
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {totalFilesUploaded}
                  </p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-full">
                  <FileImage className="w-8 h-8 text-pink-400" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-sm border border-indigo-500/20 p-6 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Total Views</h3>
                  <p className="text-3xl font-bold text-white">{totalViews}</p>
                </div>
                <div className="p-3 bg-indigo-500/20 rounded-full">
                  <Eye className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Search Bar */}
        {user.uploads.length > 6 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-12 pr-4 rounded-xl bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Uploads Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-300 mb-6 flex items-center">
            <FileImage className="w-5 h-5 mr-2" />
            Your Uploads
            <span className="ml-2 text-sm text-gray-500">
              ({filteredUploads.length} of {user.uploads.length})
            </span>
          </h2>

          {user.loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="overflow-hidden rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 animate-pulse"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-48 w-full bg-zinc-800/50"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-zinc-800/50 rounded"></div>
                    <div className="h-3 bg-zinc-800/50 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-800/50 rounded w-1/2"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUploads.length === 0 ? (
                <motion.div
                  className="col-span-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex flex-col items-center justify-center text-gray-400 rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 p-12">
                    <AlertCircle className="h-12 w-12 mb-4 text-gray-500" />
                    <h3 className="text-lg font-semibold mb-2">No uploads found</h3>
                    <p className="text-sm text-center">
                      {searchTerm ? "Try adjusting your search criteria" : "Upload your first file to get started"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                filteredUploads.map((image: Upload, index) => (
                  <motion.div
                    key={image.fileName}
                    className="group relative overflow-hidden rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={`https://s3.tritan.gg/images/${image.fileName}`}
                        alt={image.fileName}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Action Buttons */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `https://${user.domain}/i/${image.fileName.split(".")
                                  .slice(0, -1)
                                  .join(".")}`
                              );
                              toast.success("Copied URL to clipboard!");
                            }}
                            className="p-2 bg-purple-500/90 hover:bg-purple-600 rounded-full text-white transition-all duration-200 hover:scale-110"
                          >
                            <CopyIcon className="h-4 w-4" />
                          </button>

                          <Link
                            href={`https://${user.domain}/i/${image.fileName.split(".")
                              .slice(0, -1)
                              .join(".")}`}
                            prefetch={false}
                          >
                            <button className="p-2 bg-indigo-500/90 hover:bg-indigo-600 rounded-full text-white transition-all duration-200 hover:scale-110">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>

                          <button
                            onClick={() =>
                              handleDelete(
                                user.apiToken,
                                `${image.fileName.split(".").slice(0, -1).join(".")}`,
                                user.removeUpload,
                                user
                              )
                            }
                            className="p-2 bg-red-500/90 hover:bg-red-600 rounded-full text-white transition-all duration-200 hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* File Information */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors duration-200">
                        <Link
                          href={`https://${user.domain}/i/${image.fileName.split(".")
                            .slice(0, -1)
                            .join(".")}`}
                          prefetch={false}
                        >
                          {image.fileName}
                        </Link>
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {new Date(image.metadata.uploadDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {image.metadata.views}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-400 font-medium">
                          {formatFileSize(image.metadata.fileSize)}
                        </span>
                        <span className="text-gray-500">
                          {image.fileName.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;