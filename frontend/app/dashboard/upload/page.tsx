"use client";

import * as React from "react";
import { useTokenStore } from "../../../stores/session.store";
import { Sidebar } from "../../../components/sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Upload, FileUp } from "lucide-react";
import { motion } from "framer-motion";

const UploadPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const userStore = useTokenStore();
  const dropzoneRef = React.useRef<HTMLDivElement>(null);

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("sharex", e.dataTransfer.files[0]);

    await uploadFile(formData);
  };

  const handleClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";

    fileInput.onchange = async () => {
      const formData = new FormData();

      if (fileInput.files) {
        formData.append("sharex", fileInput.files[0]);
        await uploadFile(formData);
      }
    };
    fileInput.click();
  };

  const uploadFile = async (formData: FormData) => {
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
        <motion.h1
          className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Upload Files
        </motion.h1>
        <motion.p
          className="mb-8 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Use the dropzone below to upload files to your account.
        </motion.p>

        <motion.div
          ref={dropzoneRef}
          className={`flex flex-col items-center justify-center w-full h-[75%] border-2 border-dashed border-zinc-600 rounded-lg cursor-pointer transition-all duration-300 group shadow-2xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-105"
            }`}
          onDrop={handleDrop}
          onClick={handleClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
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
        </motion.div>
      </main>
    </div>
  );
};

export default UploadPage;
