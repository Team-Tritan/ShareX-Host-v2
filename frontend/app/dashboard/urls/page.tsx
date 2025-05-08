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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
          You can view, edit, delete, and copy your shortened URLs here.
        </motion.div>

        <button
          className="mb-12 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-300"
          onClick={handleCreateUrl}
        >
          Shorten a URL
        </button>
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
            {user.urls.length === 0 ? (
              <>
                <div className="col-span-full flex items-center justify-center text-gray-400 rounded-lg">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <div className="col-span-full text-gray-400 rounded-lg">
                    You do not have any shortened URLs.
                  </div>
                </div>
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg bg-[#121114] animate-pulse"
                  >
                    <div className="h-12 w-full bg-[#121114]"></div>
                    <div className="p-4">
                      <div className="h-4 bg-zinc-800 mb-2"></div>
                      <div className="h-4 bg-zinc-800 mb-2"></div>
                      <div className="h-4 bg-zinc-800"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              user.urls.map((url) => (
                <div
                  key={url.slug}
                  className="relative overflow-hidden rounded-lg bg-[#121114] group shadow-2xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-105"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-300">
                      <Link prefetch={false} href={`/u/${url.slug}`}>
                        /u/{url.slug}
                      </Link>
                      <ChevronRight className="inline mx-2 text-white font-semibold" />
                      <Link prefetch={false} href={url.url}>
                        {url.url}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      Created on {new Date(url.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-pink-400">{url.clicks}</span> Clicks
                    </p>

                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link prefetch={false}
                        href={`https://${user.domain}/u/${url.slug}`}>
                        <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>

                      <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300">
                        <CopyIcon
                          className="h-4 w-4"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://${user.domain}/u/${url.slug}`
                            );
                            toast.success("Copied URL to clipboard!");
                          }}
                        />
                      </button>

                      <button
                        className="flex items-center rounded bg-pink-500 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300"
                        onClick={() => handleEdit(url.key, url.slug)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        className="flex items-center rounded bg-pink-500 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-300"
                        onClick={() =>
                          handleDelete(user.apiToken, url.slug, user.removeUrl)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
