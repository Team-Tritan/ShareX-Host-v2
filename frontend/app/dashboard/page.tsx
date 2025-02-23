/* eslint-disable @next/next/no-img-element */
"use client";

import Unauthenticated from "@/components/unauth";
import { Sidebar } from "@/components/sidebar";
import { useTokenStore } from "@/stores/session.store";
import { AlertCircle, Eye, InfoIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  displayName: string;
  uploads: Upload[];
}

const formatFileSize = (size: number) => {
  if (size >= 1e9) {
    return (size / 1e9).toFixed(2) + " GB";
  } else if (size >= 1e6) {
    return (size / 1e6).toFixed(2) + " MB";
  } else {
    return (size / 1e3).toFixed(2) + " KB";
  }
};

const Dashboard: React.FC = () => {
  const [imageList, setImageList] = useState<Upload[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const userStore = useTokenStore();

  const totalStorageUsed = imageList.reduce(
    (acc, image) => acc + image.Metadata.FileSize,
    0
  );
  const totalFilesUploaded = imageList.length;
  const totalViews = imageList.reduce(
    (acc, image) => acc + image.Metadata.Views,
    0
  );

  if (!userStore.apiToken) return <Unauthenticated />

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/uploads", {
          headers: {
            key: userStore.apiToken,
          },
          method: "POST",
        });

        const data: ApiResponse = await response.json();

        userStore.setDisplayName(data.displayName);
        setImageList(data.uploads || []);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    const intervalId = setInterval(fetchImages, 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStore.apiToken]);

  const handleDelete = async (FileName: string) => {
    try {
      const response = await fetch(`/api/delete-upload/${FileName}`, {
        headers: {
          key: userStore.apiToken,
        },
        method: "DELETE",
      });

      if (response.ok) {
        setImageList((prevList) =>
          prevList.filter((image) => image.FileName !== FileName)
        );

        toast.info("File deleted successfully!");
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#0d0c0e] text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 overflow-auto p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"
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
        <h1
          className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
        >
          Welcome, {userStore.displayName}!
        </h1>
        <div
          className="text-gray-400 mb-12 text-lg"
        >
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

        <p className="text-gray-400 text-md mb-2 font-semibold">Your Uploads:</p>

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
            {imageList.length === 0 ? (
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
              imageList.map((image) => (

                <div
                  key={image.Key}
                  className="relative overflow-hidden rounded-lg bg-[#121114] group shadow-2xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-105"
                >
                  <img
                    src={`https://s3.tritan.gg/images/${image.FileName}`}
                    alt={image.FileName}
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 text-white opacity-75 group-hover:opacity-100 transition-opacity duration-300">
                    <InfoIcon className="h-6 w-6 text-purple-400" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/i/${image.FileName.split(".")
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
                          `${image.FileName.split(".").slice(0, -1).join(".")}`
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
