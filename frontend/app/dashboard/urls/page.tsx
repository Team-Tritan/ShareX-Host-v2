/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Url, ApiResponseUrl } from "@/typings";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import Prompter from "@/components/Prompt";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  AlertCircle,
  ChevronRight,
  CopyIcon,
  Edit3,
  Eye,
  Trash2,
  Plus,
  LinkIcon,
  BarChart3,
  Calendar,
  Search,
} from "lucide-react";

const fetchUrls = async (
  apiToken: string,
  setUrls: (urls: Url[]) => void,
  setLoading: (loading: boolean) => void
): Promise<void> => {
  try {
    const response = await fetch("/api/urls", {
      headers: {
        key: apiToken,
      },
      method: "GET",
    });

    const data: ApiResponseUrl = await response.json();

    setUrls(data.urls || []);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    toast.error("Failed to fetch URLs");
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (
  apiToken: string,
  slug: string,
  removeUrl: (slug: string) => void
): Promise<void> => {
  try {
    const response = await fetch(`/api/delete-url/${slug}`, {
      headers: {
        key: apiToken,
      },
      method: "DELETE",
    });

    if (response.ok) {
      removeUrl(slug);
      toast.success("URL deleted successfully!");
    } else {
      const errorData = await response.json();

      toast.error(
        "Failed to delete URL: " + (errorData.message || "Unknown error")
      );
    }
  } catch {
    toast.error("Error deleting URL");
  }
};

const Urls: React.FC = () => {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editUrl, setEditUrl] = useState<Url | null>(null);
  const [createUrlOpen, setCreateUrlOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  if (!user.apiToken) return <Unauthenticated />;

  useEffect(() => {
    fetchUrls(user.apiToken, user.setUrls, user.setLoading);

    const intervalId = setInterval(
      () => fetchUrls(user.apiToken, user.setUrls, user.setLoading),
      10000
    );

    return () => clearInterval(intervalId);
  }, [user.apiToken, user.setUrls, user.setLoading]);

  const handleEdit = async (Key: string, currentSlug: string) => {
    setEditUrl({
      key: Key,
      url: "",
      createdAt: "",
      ip: "",
      slug: currentSlug,
      clicks: 0,
    });
  };

  const handleUpdateSlug = async (newSlug: string) => {
    if (!editUrl || newSlug === editUrl.slug) return setEditUrl(null);

    try {
      const response = await fetch(`/api/url/${editUrl.slug}`, {
        headers: {
          key: user.apiToken,
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ new_slug: newSlug }),
      });

      if (response.status === 200) {
        user.updateUrl(editUrl.key, newSlug);
        toast.success("Slug updated successfully!");
      } else if (response.status === 409) {
        toast.error("Slug is already taken. Please enter a new slug.");
      } else {
        toast.error("Error updating slug.");
      }
    } catch {
      toast.error("Error updating slug.");
    } finally {
      setEditUrl(null);
    }
  };

  const handleCreateUrl = async () => {
    setCreateUrlOpen(true);
  };

  const handleShortenUrl = async (newUrl: string) => {
    setCreateUrlOpen(false);
    if (!newUrl) return toast.error("URL cannot be empty.");

    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://"))
      return toast.error("URL must start with http:// or https://");

    try {
      const response = await fetch("/api/url", {
        headers: {
          key: user.apiToken,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ url: newUrl }),
      });

      if (response.ok) {
        toast.success("URL created successfully!");
      } else {
        toast.error("Failed to create URL.");
      }
    } catch (error) {
      console.error("Error creating URL:", error);
      toast.error("Error creating URL.");
    }
  };

  const filteredUrls = user.urls.filter(
    (url) =>
      url.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClicks = user.urls.reduce((sum, url) => sum + url.clicks, 0);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0d0c0e] via-[#1a1a1d] to-[#0d0c0e] text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 overflow-auto p-6 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
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
                        <span className="text-sm text-gray-400">URL Shortener:</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-400">Active</span>
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
                        URL Shortener
                      </span>
                    </h1>

                    <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                      Create, manage, and track your shortened URLs with detailed analytics and custom slugs.
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
                          <LinkIcon className="w-5 h-5 text-purple-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-purple-300 font-medium">Total URLs</div>
                          <div className="text-lg font-bold text-white">
                            {user.urls.length}
                          </div>
                        </div>
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
                          <BarChart3 className="w-5 h-5 text-pink-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-pink-300 font-medium">Total Clicks</div>
                          <div className="text-lg font-bold text-white">
                            {totalClicks}
                          </div>
                        </div>
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
                          <div className="text-xs text-indigo-300 font-medium">Avg. Clicks</div>
                          <div className="text-lg font-bold text-white">
                            {user.urls.length > 0 ? Math.round(totalClicks / user.urls.length) : 0}
                          </div>
                        </div>
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
                          <Calendar className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-emerald-300 font-medium">This Month</div>
                          <div className="text-lg font-bold text-white">
                            {user.urls.filter(url => {
                              const urlDate = new Date(url.createdAt);
                              const thisMonth = new Date();
                              return urlDate.getMonth() === thisMonth.getMonth() && urlDate.getFullYear() === thisMonth.getFullYear();
                            }).length}
                          </div>
                        </div>
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
                      <span className="text-sm text-gray-400">Service Status: </span>
                      <span className="text-sm font-medium text-green-400">All systems operational</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Domain: </span>
                      <span className="text-sm font-medium text-white">{user.domain}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">
                        {totalClicks} total clicks
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Total URLs
                </h3>
                <p className="text-3xl font-bold text-white">
                  {user.urls.length}
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <LinkIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm border border-pink-500/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Total Clicks
                </h3>
                <p className="text-3xl font-bold text-white">{totalClicks}</p>
              </div>
              <div className="p-3 bg-pink-500/20 rounded-full">
                <BarChart3 className="w-8 h-8 text-pink-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-sm border border-indigo-500/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Avg. Clicks
                </h3>
                <p className="text-3xl font-bold text-white">
                  {user.urls.length > 0 ? Math.round(totalClicks / user.urls.length) : 0}
                </p>
              </div>
              <div className="p-3 bg-indigo-500/20 rounded-full">
                <Eye className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            onClick={handleCreateUrl}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Short URL
          </motion.button>

          {user.urls.length > 0 && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-12 pr-4 rounded-xl bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-300 mb-6 flex items-center">
            <LinkIcon className="w-5 h-5 mr-2" />
            Your URLs
            <span className="ml-2 text-sm text-gray-500">
              ({filteredUrls.length} of {user.urls.length})
            </span>
          </h2>

          {user.loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="overflow-hidden rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 animate-pulse"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-32 w-full bg-zinc-800/50"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-zinc-800/50 rounded"></div>
                    <div className="h-3 bg-zinc-800/50 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-800/50 rounded w-1/2"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUrls.length === 0 ? (
                <motion.div
                  className="col-span-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex flex-col items-center justify-center text-gray-400 rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 p-12">
                    <AlertCircle className="h-12 w-12 mb-4 text-gray-500" />
                    <h3 className="text-lg font-semibold mb-2">
                      {user.urls.length === 0 ? "No URLs yet" : "No URLs found"}
                    </h3>
                    <p className="text-sm text-center">
                      {user.urls.length === 0
                        ? "Create your first short URL to get started"
                        : "Try adjusting your search criteria"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                filteredUrls.map((url, index) => (
                  <motion.div
                    key={url.slug}
                    className="group relative overflow-hidden rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-purple-400">
                              Short URL
                            </span>
                          </div>
                          <Link
                            href={`https://${user.domain}/u/${url.slug}`}
                            className="text-lg font-semibold text-white hover:text-purple-400 transition-colors duration-200 truncate block"
                            prefetch={false}
                          >
                            /{url.slug}
                          </Link>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `https://${user.domain}/u/${url.slug}`
                              );
                              toast.success("Copied URL to clipboard!");
                            }}
                            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 transition-all duration-200 hover:scale-110"
                          >
                            <CopyIcon className="h-4 w-4" />
                          </button>
                          <Link
                            href={`https://${user.domain}/u/${url.slug}`}
                            prefetch={false}
                          >
                            <button className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-400 transition-all duration-200 hover:scale-110">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleEdit(url.key, url.slug)}
                            className="p-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg text-pink-400 transition-all duration-200 hover:scale-110"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(user.apiToken, url.slug, user.removeUrl)
                            }
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all duration-200 hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Redirects to</span>
                        </div>
                        <Link
                          href={url.url}
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm truncate block pl-6"
                          prefetch={false}
                        >
                          {url.url}
                        </Link>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-pink-400" />
                            <span className="text-sm text-gray-400">
                              <span className="text-pink-400 font-medium">
                                {url.clicks}
                              </span>{" "}
                              clicks
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm text-gray-400">
                              {new Date(url.createdAt).toLocaleDateString()}
                            </span>
                          </div>
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
      
      {editUrl && (
        <Prompter
          title="Edit Slug"
          message="Enter new slug:"
          onConfirm={handleUpdateSlug}
          onCancel={() => setEditUrl(null)}
        />
      )}
      {createUrlOpen && (
        <Prompter
          title="Shorten URL"
          message="Enter the URL to shorten:"
          onConfirm={handleShortenUrl}
          onCancel={() => setCreateUrlOpen(false)}
        />
      )}
    </div>
  );
};

export default Urls;