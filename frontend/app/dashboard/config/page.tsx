"use client";

import * as React from "react";
import { useTokenStore } from "../../../stores/session.store";
import { Sidebar } from "../../../components/sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
            const fileName = type === "upload" ? "sharex-img-config.sxcu" : "sharex-shortener-config.sxcu";
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Config generated successfully!");
        } catch (error) {
            alert(`Error generating ShareX config: ${error}`);
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
                <h1 className="mb-2 text-2xl font-bold">
                    Configuration Generator
                </h1>
                <div className="text-gray-400 mb-12">
                    Use the buttons below to generate ShareX configs for uploading files or shortening URLs.
                </div>
                <div className="flex flex-col space-y-4">
                    <button
                        className="flex items-center w-1/4 justify-center rounded bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        onClick={() => generateConfig("upload")}
                    >
                        ShareX Images/Files
                    </button>
                    <button
                        className="flex items-center w-1/4 justify-center rounded bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        onClick={() => generateConfig("url")}
                    >
                        ShareX URL Shortener
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Config;