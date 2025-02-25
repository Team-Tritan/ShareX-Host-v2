"use client";

import { useState, useRef, DragEvent } from "react";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { FileUp, Upload } from "lucide-react";
import { toast } from "react-hot-toast";

const UploadPage: React.FC = () => {
  const user = useUser();
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  if (!user.apiToken) return <Unauthenticated />;

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0)
      await uploadFile(e.dataTransfer.files[0]);
  };

  const handleClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";

    fileInput.onchange = async () => {
      if (fileInput.files && fileInput.files.length > 0)
        await uploadFile(fileInput.files[0]);
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
          key: user.apiToken,
        },
      });

      if (response.ok) {
        toast.success("File uploaded successfully!");
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
        <motion.h1
          className="mb-2 text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Upload Media
        </motion.h1>
        <motion.div
          className="text-gray-400 text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          You can upload images, videos, and more here.
        </motion.div>

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
