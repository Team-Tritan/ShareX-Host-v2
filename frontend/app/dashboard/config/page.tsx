/* eslint-disable jsx-a11y/alt-text */
"use client";

import { Sidebar } from "@/components/sidebar";
import { useTokenStore } from "@/stores/session.store";
import { motion } from "framer-motion";
import { Download, Image, Link } from "lucide-react";
import NextLink from "next/link";
import * as React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Config: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [selectedDomain, setSelectedDomain] = React.useState("");
  const userStore = useTokenStore();

  const domains = [
    "https://i.tritan.gg",
    "https://i.cockz.me",
    "https://fakyuu.tritan.gg",
    "https://big.cockz.me",
    "https://cdn.cockz.me",
  ];

  if (!userStore.apiToken) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d0c0e] text-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-[#121114] rounded-xl shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">ShareX Host</h1>
          </div>
          <p className="text-center">Please log in to view this page.</p>
          <div className="flex justify-center">
            <NextLink href="/">
              <button className="w-full rounded bg-purple-500 py-2 px-4 text-white font-bold shadow hover:bg-purple-600 transition duration-200">
                Home Page
              </button>
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  const generateConfig = async (type: string) => {
    try {
      const response = await fetch(
        `/api/config?type=${type}&domain=${selectedDomain}`,
        {
          headers: {
            key: userStore.apiToken,
          },
          method: "POST",
        }
      );

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

      toast.info("Config generated successfully!");
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
        <motion.h1
          className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          ShareX Config Generator
        </motion.h1>
        <motion.div
          className="text-gray-400 mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Use the buttons below to generate ShareX configs for uploading files
          or shortening URLs.
        </motion.div>

        <motion.div
          className="flex space-x-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div
            className="w-64 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold text-center text-white mb-4">
                Images/Files
              </h2>
              <div className="flex justify-center mb-4">
                <Image className="w-16 h-16 text-white" />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="domain-upload"
                  className="block text-sm font-medium text-gray-300"
                >
                  Select Domain
                </label>
                <select
                  id="domain-upload"
                  name="domain-upload"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#0d0c0e] text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  <option value="">Default</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="w-full bg-white text-purple-700 font-semibold py-2 px-4 rounded hover:bg-purple-100 transition duration-300 flex items-center justify-center"
                onClick={() => generateConfig("upload")}
              >
                <Download className="mr-2 h-4 w-4" /> Download Config
              </button>
            </div>
          </motion.div>

          <motion.div
            className="w-64 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold text-center text-white mb-4">
                URL Shortener
              </h2>
              <div className="flex justify-center mb-4">
                <Link className="w-16 h-16 text-white" />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="domain-url"
                  className="block text-sm font-medium text-gray-300"
                >
                  Select Domain
                </label>
                <select
                  id="domain-url"
                  name="domain-url"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#0d0c0e] text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  <option value="">Default</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="w-full bg-white text-indigo-700 font-semibold py-2 px-4 rounded hover:bg-indigo-100 transition duration-300 flex items-center justify-center"
                onClick={() => generateConfig("url")}
              >
                <Download className="mr-2 h-4 w-4" /> Download Config
              </button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Config;
