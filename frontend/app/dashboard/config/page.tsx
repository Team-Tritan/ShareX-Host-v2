/* eslint-disable jsx-a11y/alt-text */
"use client";

import * as React from "react";
import { useTokenStore } from "../../../stores/session.store";
import { Sidebar } from "../../../components/sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, Image, Link } from 'lucide-react';

const Config: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
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

  const generateConfig = async (type: string) => {
    try {
      const response = await fetch(`/api/config?type=${type}`, {
        headers: {
          key: userStore.apiToken,
        },
        method: "POST",
      });

      let data = await response.json();
      if (typeof data === "object") {
        data = JSON.stringify(data, null, 2);
      }

      const blob = new Blob([data], { type: "application/json" });
      const fileName =
        type === "upload"
          ? "sharex-img-config.sxcu"
          : "sharex-shortener-config.sxcu";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Config generated successfully!");
    } catch (error) {
      toast.error(`Error generating ShareX config: ${error}`);
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
        <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          ShareX Config Generator
        </h1>
        <div className="text-gray-400 mb-12">
          Use the buttons below to generate ShareX configs for uploading files
          or shortening URLs.
        </div>

        <div className="flex  space-x-8">
          <div className="w-64 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-bold text-center text-white mb-4">Images/Files</h2>
              <div className="flex justify-center mb-4">
                <Image className="w-16 h-16 text-white" />
              </div>
              <button
                className="w-full bg-white text-purple-700 font-semibold py-2 px-4 rounded hover:bg-purple-100 transition duration-300 flex items-center justify-center"
                onClick={() => generateConfig("upload")}
              >
                <Download className="mr-2 h-4 w-4" /> Download Config
              </button>
            </div>
          </div>

          <div className="w-64 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-bold text-center text-white mb-4">URL Shortener</h2>
              <div className="flex justify-center mb-4">
                <Link className="w-16 h-16 text-white" />
              </div>
              <button
                className="w-full bg-white text-indigo-700 font-semibold py-2 px-4 rounded hover:bg-indigo-100 transition duration-300 flex items-center justify-center"
                onClick={() => generateConfig("url")}
              >
                <Download className="mr-2 h-4 w-4" /> Download Config
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Config;
