"use client";

import * as React from "react";
import { useTokenStore } from "../../../stores/session.store";
import { Sidebar } from "../../../components/sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Upload: React.FC = () => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropzoneRef.current) dropzoneRef.current.classList.add("dropzone-bg");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();

    if (dropzoneRef.current)
      dropzoneRef.current.classList.remove("dropzone-bg");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove("dropzone-bg");
    }

    const formData = new FormData();
    formData.append("sharex", e.dataTransfer.files[0]);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          key: userStore.apiToken,
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

  const handleClick = () => {
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.style.display = "none";

    fileInput.onchange = async () => {
      const formData = new FormData();

      if (fileInput.files) {
        formData.append("sharex", fileInput.files[0]);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            headers: {
              key: userStore.apiToken,
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
      }
    };
    fileInput.click();
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
        <h1 className="mb-2 text-2xl font-bold">Upload Files</h1>
        <p className="mb-4 text-gray-400">
          Use the dropzone above to upload files to your account.
        </p>

        <div
          ref={dropzoneRef}
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <p className="text-gray-400">
            Drag and drop files here, or click to select files
          </p>
        </div>
      </main>
    </div>
  );
};

export default Upload;
