"use client";

import * as React from "react";
import { Trash2, Eye, InfoIcon } from "lucide-react";
import { useTokenStore } from "../../stores/session.store";
import { Sidebar } from "../../components/sidebar";
import Link from "next/link";
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
  const [imageList, setImageList] = React.useState<Upload[]>([]);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
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

  React.useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    const intervalId = setInterval(fetchImages, 10000);
    return () => clearInterval(intervalId);
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
        console.error("Failed to delete image");
        toast.error("Failed to delete image");
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
          You can view and manage your uploads below.
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
        ) : imageList.length === 0 ? (
          <p className="text-gray-400 py-4 px-4 border border-zinc-800 w-1/4 rounded-xl">
            No uploads to display
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imageList.map((image) => (
              <div
                key={image.Key}
                className="relative overflow-hidden rounded-lg bg-[#121114] group"
              >
                <img
                  src={`https://s3.tritan.gg/images/${image.FileName}`}
                  alt={image.FileName}
                  className="h-48 w-full object-cover"
                />
                <div className="absolute top-2 right-2 text-white opacity-75 group-hover:opacity-100 transition-opacity duration-300">
                  <InfoIcon className="h-6 w-6" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href={`/i/${image.FileName.split(".")
                      .slice(0, -1)
                      .join(".")}`}
                  >
                    <button className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <button
                    className="flex items-center rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    onClick={() => handleDelete(image.FileName.split(".")[0])}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-purple-400">
                    <Link
                      href={`/i/${image.FileName.split(".")
                        .slice(0, -1)
                        .join(".")}`}
                    >
                      {image.FileName}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-400">
                    Uploaded on{" "}
                    {new Date(image.Metadata.UploadDate).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {image.Metadata.Views} Views
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatFileSize(image.Metadata.FileSize)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
