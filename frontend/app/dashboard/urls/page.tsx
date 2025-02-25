"use client";

import Unauthenticated from "@/components/unauth";
import { Sidebar } from "@/components/sidebar";
import { useTokenStore } from "@/stores/session.store";
import { useUrlsStore } from "@/stores/urls.store";
import {
  AlertCircle,
  ChevronRight,
  CopyIcon,
  Edit3,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';


interface Url {
  Key: string;
  URL: string;
  CreatedAt: string;
  IP: string;
  Slug: string;
  Clicks: number;
}

interface ApiResponse {
  status: number;
  urls: Url[];
}

const Urls: React.FC = () => {
  const { urls, setUrls, removeUrl, updateUrl, setLoading, loading } =
    useUrlsStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userStore = useTokenStore();

  if (!userStore.apiToken) return <Unauthenticated />;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchUrls = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/urls", {
          headers: { key: userStore.apiToken },
          method: "GET",
        });

        const data: ApiResponse = await response.json();
        setUrls(data.urls || []);
      } catch (error) {
        console.error("Error fetching URLs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
    const intervalId = setInterval(fetchUrls, 10000);
    return () => clearInterval(intervalId);
  }, [userStore.apiToken, setUrls, setLoading]);

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/delete-url/${slug}`, {
        headers: { key: userStore.apiToken },
        method: "DELETE",
      });

      if (response.ok) {
        removeUrl(slug);
        toast.success("URL deleted successfully!");
      } else {
        toast.error("Failed to delete URL");
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("Error deleting URL");
    }
  };

  const handleEdit = async (Key: string, currentSlug: string) => {
    const newSlug = prompt("Enter new slug:", currentSlug);
    if (!newSlug || newSlug === currentSlug) return;

    try {
      const response = await fetch(`/api/url/${currentSlug}`, {
        headers: {
          key: userStore.apiToken,
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ new_slug: newSlug }),
      });

      if (response.status === 200) {
        updateUrl(Key, newSlug);
        toast.success("Slug updated successfully!");
      } else if (response.status === 409) {
        toast.error("Slug is already taken. Please enter a new slug.");
      } else {
        toast.error("Error updating slug.");
      }
    } catch {
      toast.error("Error updating slug.");
    }
  };

  const handleCreateUrl = async () => {
    const newUrl = prompt("Enter the URL to shorten:");
    if (!newUrl) return toast.error("URL cannot be empty.");

    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://"))
      return toast.error("URL must start with http:// or https://");

    try {
      const response = await fetch("/api/url", {
        headers: {
          key: userStore.apiToken,
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
        <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Welcome, {userStore.displayName}!
        </h1>
        <div className="text-gray-400 mb-8 text-lg">
          You can view and manage your URLs below.
        </div>
        <button
          className="mb-12 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-300"
          onClick={handleCreateUrl}
        >
          Shorten a URL
        </button>
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
            {urls.length === 0 ? (
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
              urls.map((url) => (
                <div
                  key={url.Key}
                  className="relative overflow-hidden rounded-lg bg-[#121114] group shadow-2xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-105"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-300">
                      <Link prefetch={false} href={`/u/${url.Slug}`}>
                        /u/{url.Slug}
                      </Link>
                      <ChevronRight className="inline mx-2 text-white font-semibold" />
                      <Link prefetch={false} href={url.URL}>
                        {url.URL}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      Created on {new Date(url.CreatedAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-pink-400">{url.Clicks}</span> Clicks
                    </p>

                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link href={`${userStore.domain}/u/${url.Slug}`}>
                        <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>

                      <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300">
                        <CopyIcon className="h-4 w-4" onClick={() => {
                          navigator.clipboard.writeText(`${userStore.domain}/u/${url.Slug}`)
                          toast.success("Copied URL to clipboard!")
                        }} />
                      </button>

                      <button
                        className="flex items-center rounded bg-pink-500 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2 transition-colors duration-300"
                        onClick={() => handleEdit(url.Key, url.Slug)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        className="flex items-center rounded bg-pink-500 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-300"
                        onClick={() => handleDelete(url.Slug)}
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
    </div>
  );
};

export default Urls;
