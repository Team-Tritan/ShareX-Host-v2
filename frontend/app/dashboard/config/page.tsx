/* eslint-disable jsx-a11y/alt-text */
"use client";

import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { useUser } from "@/stores/user";
import { motion } from "framer-motion";
import { Download, Image, Link, PencilIcon } from "lucide-react";
import * as React from "react";
import { toast } from "react-hot-toast";

type ConfigType = "upload" | "url" | "text";

const Config: React.FC = () => {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  if (!user.apiToken) return <Unauthenticated />;

  const generateConfig = async (type: ConfigType) => {
    try {
      const response = await fetch(
        `/api/config?type=${type}`,
        {
          headers: {
            key: user.apiToken,
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
          : type === "url"
            ? "sharex-shortener-config.sxcu"
            : "sharex-text-config.sxcu";

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
        <motion.h1
          className="mb-2 text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text"
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
          Generate ShareX configurations for uploading files or shortening URLs.
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ConfigCard
            title="Images/Files"
            icon={<Image className="w-6 h-6 text-violet-400" />}
            domainId="domain-upload"
            generateConfig={() => generateConfig("upload")}
            buttonColor="bg-violet-500 hover:bg-violet-600"
            desc="Upload images, videos, and files through ShareX."
          />
          <ConfigCard
            title="URL Shortener"
            icon={<Link className="w-6 h-6 text-fuchsia-400" />}
            domainId="domain-url"
            generateConfig={() => generateConfig("url")}
            buttonColor="bg-fuchsia-500 hover:bg-fuchsia-600"
            desc="Shorten URLs through ShareX."
          />

          <ConfigCard
            title="Pastebin (Text Uploader)"
            icon={<PencilIcon className="w-6 h-6 text-indigo-400" />}
            domainId="domain-text"
            generateConfig={() => generateConfig("text")}
            buttonColor="bg-indigo-500 hover:bg-indigo-600"
            desc="Upload text to our Pastebin service."
          />
        </motion.div>
      </main>
    </div>
  );
};

type ConfigCardProps = {
  title: string;
  icon: React.ReactNode;
  domainId: string;
  generateConfig: () => void;
  buttonColor: string;
  desc?: string;
};

const ConfigCard: React.FC<ConfigCardProps> = ({
  title,
  icon,
  generateConfig,
  buttonColor,
  desc,
}) => (
  <motion.div
    className="rounded-xl w-full max-w-sm bg-gradient-to-b from-violet-500/10 to-violet-500/5 border border-violet-500/10 backdrop-blur-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <div className="p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-500/10 mb-4">
        {icon}
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      {desc && <p className="text-gray-400 text-sm mb-4">{desc}</p>}

      <div className="space-y-4">
        <button
          onClick={generateConfig}
          className={`w-full inline-flex items-center justify-center rounded-lg ${buttonColor} text-white px-4 py-2.5 text-sm font-medium transition-colors`}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Config
        </button>
      </div>
    </div>
  </motion.div>
);

export default Config;
