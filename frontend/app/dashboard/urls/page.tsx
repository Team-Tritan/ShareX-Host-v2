"use client";

import { useEffect, useState } from "react";
import { Trash2, Eye, InfoIcon, Edit3, ArrowRight } from "lucide-react";
import { useTokenStore } from "../../../stores/session.store";
import { Sidebar } from "../../../components/sidebar";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  displayName: string;
}

const Urls: React.FC = () => {
  const [urlList, setUrlList] = useState<Url[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const userStore = useTokenStore();

  if (!userStore.apiToken) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d0c0e] text-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-[#121114] rounded-xl shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">ShareX Host</h1>
          </div>
          <p className="text-center">Please log in to view this page.</p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await fetch("/api/urls", {
          headers: {
            key: userStore.apiToken,
          },
          method: "POST",
        });

        const data: ApiResponse = await response.json();
        userStore.setDisplayName(data.displayName);
        setUrlList(data.urls || []);
      } catch (error) {
        console.error("Error fetching URLs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();

    const intervalId = setInterval(fetchUrls, 10000);
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStore.apiToken]);

  const handleDelete = async (Key: string) => {
    try {
      const response = await fetch(`/api/delete-url/${Key}`, {
        headers: {
          key: userStore.apiToken,
        },
        method: "DELETE",
      });

      if (response.ok) {
        setUrlList((prevList) => prevList.filter((url) => url.Key !== Key));
        toast.info("URL deleted successfully!");
      } else {
        console.error("Failed to delete URL");
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
        setUrlList((prevList) =>
          prevList.map((url) =>
            url.Key === Key ? { ...url, Slug: newSlug } : url
          )
        );
        toast.success("Slug updated successfully!");
      } else if (response.status === 409) {
        toast.error("Slug is already taken. Please enter a new slug.");
      } else {
        toast.error("Error updating slug.");
      }
    } catch (error) {
      console.error("Error updating slug:", error);
      toast.error("Error updating slug.");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#0d0c0e] text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 overflow-auto p-6 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <h1 className="mb-2 text-2xl font-bold">
          Welcome, {userStore.displayName}!
        </h1>
        <div className="text-gray-400 mb-12">
          You can view and manage your URLs below.
        </div>

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
        ) : urlList.length === 0 ? (
          <p className="text-gray-400 py-4 px-4 border border-zinc-800 w-1/4 rounded-xl">
            No URLs to display
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {urlList.map((url) => (
              <div
                key={url.Key}
                className="relative overflow-hidden rounded-lg bg-[#121114] group"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-purple-400">
                    <Link href={`/u/${url.Slug}`}>/u/{url.Slug}</Link>
                    <ArrowRight className="inline mx-2" />
                    <Link href={url.URL}>{url.URL}</Link>
                  </h3>
                  <p className="text-sm text-gray-400">
                    Created on {new Date(url.CreatedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">{url.Clicks} Clicks</p>
                  <div className="absolute top-2 right-2 text-white opacity-75 group-hover:opacity-100 transition-opacity duration-300">
                    <InfoIcon className="h-6 w-6" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/u/${url.Slug}`}>
                      <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2"
                      onClick={() => handleEdit(url.Key, url.Slug)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                      onClick={() => handleDelete(url.Slug)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Urls;
