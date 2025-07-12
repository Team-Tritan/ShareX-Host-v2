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
import { AlertCircle, CopyIcon, Eye, Trash2, Search, TrendingUp, HardDrive, FileImage, Calendar, Clock, Sparkles, Activity } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const recentUploads = user.uploads.filter(upload => {
    const uploadDate = new Date(upload.metadata.uploadDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return uploadDate > weekAgo;
  }).length;

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

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#171619]/90 via-[#1a1a1d]/80 to-[#171619]/70 backdrop-blur-xl border border-zinc-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-pink-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }}></div>

              <div className="absolute top-10 right-20 w-4 h-4 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-20 left-32 w-3 h-3 bg-pink-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute bottom-20 right-32 w-5 h-5 bg-indigo-400/30 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <motion.div
                    className="flex items-center space-x-4 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">API Status:</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-400">Connected</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <h1 className="text-4xl lg:text-6xl font-bold">
                      <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Welcome back,
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-pink-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        {user.displayName}!
                      </span>
                    </h1>

                    <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                      Here’s a quick overview of your uploads and account status. You can manage your files, view statistics, and customize your settings from the sidebar.
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  className="grid grid-cols-2 gap-4 min-w-[300px]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 backdrop-blur-sm border border-purple-500/40 p-4 shadow-xl group"
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-500/30 rounded-lg">
                          <HardDrive className="w-5 h-5 text-purple-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-purple-300 font-medium">Storage</div>
                          <div className="text-lg font-bold text-white">
                            {formatFileSize(totalStorageUsed)}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-purple-900/30 rounded-full h-1">
                        <motion.div
                          className="bg-purple-400 h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "60%" }}
                          transition={{ delay: 0.6, duration: 1 }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/30 to-pink-600/20 backdrop-blur-sm border border-pink-500/40 p-4 shadow-xl group"
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-pink-500/30 rounded-lg">
                          <FileImage className="w-5 h-5 text-pink-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-pink-300 font-medium">Files</div>
                          <div className="text-lg font-bold text-white">
                            {totalFilesUploaded.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-pink-300">
                        <Sparkles className="w-3 h-3" />
                        <span>+{recentUploads} this week</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 backdrop-blur-sm border border-indigo-500/40 p-4 shadow-xl group"
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-indigo-500/30 rounded-lg">
                          <Eye className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-indigo-300 font-medium">Views</div>
                          <div className="text-lg font-bold text-white">
                            {totalViews.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-indigo-300">
                        <TrendingUp className="w-3 h-3" />
                        <span>Avg: {totalFilesUploaded > 0 ? Math.round(totalViews / totalFilesUploaded) : 0}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/40 p-4 shadow-xl group"
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-emerald-500/30 rounded-lg">
                          <Activity className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-emerald-300 font-medium">Activity</div>
                          <div className="text-lg font-bold text-white">
                            {recentUploads}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-emerald-300">
                        <Clock className="w-3 h-3" />
                        <span>Last 7 days</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                className="mt-8 pt-6 border-t border-zinc-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-400">System Status: </span>
                      <span className="text-sm font-medium text-green-400">All systems operational</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Last updated: </span>
                      <span className="text-sm font-medium text-white">Just now</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">
                        {recentUploads} uploads this week
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {user.uploads.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search your uploads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-12 pr-4 rounded-xl bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">View:</span>
                <div className="flex items-center bg-[#171619]/80 rounded-lg p-1 border border-zinc-800/50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${viewMode === 'grid'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${viewMode === 'list'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-300 flex items-center">
              <FileImage className="w-5 h-5 mr-2" />
              Your Uploads
              <span className="ml-2 text-sm text-gray-500 bg-zinc-800/50 px-2 py-1 rounded-full">
                {filteredUploads.length} of {user.uploads.length}
              </span>
            </h2>

            {filteredUploads.length > 0 && (
              <div className="text-sm text-gray-500">
                {searchTerm && `Filtered by "${searchTerm}"`}
              </div>
            )}
          </div>

          {user.loading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="overflow-hidden rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 animate-pulse"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`${viewMode === 'grid' ? 'h-48' : 'h-24'} w-full bg-zinc-800/50`}></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-zinc-800/50 rounded"></div>
                    <div className="h-3 bg-zinc-800/50 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-800/50 rounded w-1/2"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
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
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-300 text-sm transition-all duration-200"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                filteredUploads.map((image: Upload, index) => (
                  <motion.div
                    key={image.fileName}
                    className={`group relative overflow-hidden rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 ${viewMode === 'list' ? 'flex items-center' : ''
                      }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : ''}`}>
                      <img
                        src={`https://s3.tritan.gg/images/${image.fileName}`}
                        alt={image.fileName}
                        className={`${viewMode === 'grid' ? 'h-48' : 'h-24'} w-full object-cover transition-transform duration-300 group-hover:scale-110`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `https://${user.domain}/i/${image.fileName.split(".")
                                  .slice(0, -1)
                                  .join(".")}`
                              );
                              toast.success("Copied URL to clipboard!");
                            }}
                            className="p-2 bg-purple-500/90 hover:bg-purple-600 rounded-full text-white transition-all duration-200 backdrop-blur-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <CopyIcon className="h-4 w-4" />
                          </motion.button>

                          <Link
                            href={`https://${user.domain}/i/${image.fileName.split(".")
                              .slice(0, -1)
                              .join(".")}`}
                            prefetch={false}
                          >
                            <motion.button
                              className="p-2 bg-indigo-500/90 hover:bg-indigo-600 rounded-full text-white transition-all duration-200 backdrop-blur-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                          </Link>

                          <motion.button
                            onClick={() =>
                              handleDelete(
                                user.apiToken,
                                `${image.fileName.split(".").slice(0, -1).join(".")}`,
                                user.removeUpload,
                                user
                              )
                            }
                            className="p-2 bg-red-500/90 hover:bg-red-600 rounded-full text-white transition-all duration-200 backdrop-blur-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 space-y-2 ${viewMode === 'list' ? 'flex-1' : ''}`}>
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

                      <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-2'}`}>
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>
                            {new Date(image.metadata.uploadDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-gray-400">
                          <Eye className="w-3 h-3 mr-1" />
                          <span>{image.metadata.views} views</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-400 font-medium">
                            {formatFileSize(image.metadata.fileSize)}
                          </span>
                          <span className="text-gray-500 uppercase">
                            {image.fileName.split('.').pop()}
                          </span>
                        </div>
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