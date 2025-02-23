"use client";

import Unauthenticated from "@/components/unauth";
import { Sidebar } from "@/components/sidebar";
import { useTokenStore } from "@/stores/session.store";
import { FileUp, Upload } from "lucide-react";
import React, { useState, useRef, DragEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UploadPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const userStore = useTokenStore();
  const dropzoneRef = useRef<HTMLDivElement>(null);

  if (!userStore.apiToken) return <Unauthenticated />;

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";

    fileInput.onchange = async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        await uploadFile(fileInput.files[0]);
      }
    };
    fileInput.click();
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("sharex", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          key: userStore.apiToken,
        },
      });

      if (response.ok) {
        toast.info("File uploaded successfully!");
      } else {
        toast.error("Error uploading file");
      }
    } catch (error) {
      toast.error(`Error uploading file: ${error}`);
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
        <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Upload Files
        </h1>
        <p className="text-gray-400 mb-12 text-lg">
          Use the dropzone below to upload files to your account.
        </p>

        <div
          ref={dropzoneRef}
          className="flex flex-col items-center justify-center w-full h-[75%] border-2 border-dashed border-zinc-600 rounded-lg cursor-pointer group shadow-2xl shadow-indigo-500/20 transition-all duration-300"
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className="w-12 h-12 mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-300 mb-2">
            Drag and drop files here
          </p>
          <p className="text-sm text-gray-400">or</p>
          <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-700 transition-colors duration-300 flex items-center">
            <FileUp className="w-4 h-4 mr-2" />
            Select Files
          </button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
