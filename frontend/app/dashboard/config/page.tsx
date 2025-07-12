/* eslint-disable jsx-a11y/alt-text */
"use client";

import { useState } from "react";
import type { ConfigType } from "@/typings";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Download, Image, Link, PencilIcon, Settings, FileText, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const Config: React.FC = () => {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user.apiToken) return <Unauthenticated />;

  const generateConfig = async (type: ConfigType) => {
    try {
      const response = await fetch(`/api/config?type=${type}`, {
        headers: {
          key: user.apiToken,
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

  const downloadAllConfigs = async () => {
    const configTypes: ConfigType[] = ["upload", "url", "text"];

    for (const type of configTypes) await generateConfig(type);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0d0c0e] via-[#1a1a1d] to-[#0d0c0e] text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 overflow-auto p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"
          }`}
      >
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
            className="text-gray-400 text-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Generate ShareX configurations for uploading files or shortening URLs.
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Available Configs
                </h3>
                <p className="text-3xl font-bold text-white">3</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm border border-pink-500/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Active Domain
                </h3>
                <p className="text-xl font-bold text-white truncate">
                  {user.domain}
                </p>
              </div>
              <div className="p-3 bg-pink-500/20 rounded-full">
                <Zap className="w-8 h-8 text-pink-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-sm border border-indigo-500/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Config Status
                </h3>
                <p className="text-xl font-bold text-white">Ready</p>
              </div>
              <div className="p-3 bg-indigo-500/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
          </div>
        </motion.div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            onClick={downloadAllConfigs}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5 mr-2" />
            Download All Configs
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-300 mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Available Configurations
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ConfigCard
              title="Images/Files"
              icon={<Image className="w-6 h-6 text-violet-400" />}
              generateConfig={() => generateConfig("upload")}
              buttonColor="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              desc="Upload images, videos, and files through ShareX."
              features={["Images", "Videos", "Documents", "Files"]}
              colorScheme="violet"
            />
            <ConfigCard
              title="URL Shortener"
              icon={<Link className="w-6 h-6 text-fuchsia-400" />}
              generateConfig={() => generateConfig("url")}
              buttonColor="bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700"
              desc="Shorten URLs through ShareX."
              features={["URL Shortening", "Analytics", "Custom Slugs", "Click Tracking"]}
              colorScheme="fuchsia"
            />
            <ConfigCard
              title="Pastebin (Text Uploader)"
              icon={<PencilIcon className="w-6 h-6 text-indigo-400" />}
              generateConfig={() => generateConfig("text")}
              buttonColor="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
              desc="Upload text to our Pastebin service."
              features={["Text Uploads", "Code Snippets", "Syntax Highlighting", "Sharing"]}
              colorScheme="indigo"
            />
          </div>
        </motion.div>

        <motion.div
          className="mt-8 p-6 bg-[#171619]/60 rounded-2xl border border-zinc-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white mb-2">Setup Instructions</h4>
              <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                <li>Download the desired configuration file(s)</li>
                <li>Double-click the .sxcu file to import it into ShareX</li>
                <li>ShareX will automatically configure the uploader</li>
                <li>Start using ShareX with your custom configuration</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

type ConfigCardProps = {
  title: string;
  icon: React.ReactNode;
  generateConfig: () => void;
  buttonColor: string;
  desc?: string;
  features?: string[];
  colorScheme: string;
};

const ConfigCard: React.FC<ConfigCardProps> = ({
  title,
  icon,
  generateConfig,
  buttonColor,
  desc,
  features,
  colorScheme,
}) => {
  const getColorClasses = (scheme: string) => {
    switch (scheme) {
      case 'violet':
        return {
          card: 'bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/50 hover:shadow-violet-500/20',
          iconBg: 'bg-violet-500/20',
          settingsIcon: 'bg-violet-500/10 text-violet-400',
          featureBg: 'bg-violet-500/20 text-violet-300',
          backgroundEffect: 'bg-violet-500/10'
        };
      case 'fuchsia':
        return {
          card: 'bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-500/20 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20',
          iconBg: 'bg-fuchsia-500/20',
          settingsIcon: 'bg-fuchsia-500/10 text-fuchsia-400',
          featureBg: 'bg-fuchsia-500/20 text-fuchsia-300',
          backgroundEffect: 'bg-fuchsia-500/10'
        };
      case 'indigo':
        return {
          card: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-indigo-500/20',
          iconBg: 'bg-indigo-500/20',
          settingsIcon: 'bg-indigo-500/10 text-indigo-400',
          featureBg: 'bg-indigo-500/20 text-indigo-300',
          backgroundEffect: 'bg-indigo-500/10'
        };
      default:
        return {
          card: 'bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/50 hover:shadow-purple-500/20',
          iconBg: 'bg-purple-500/20',
          settingsIcon: 'bg-purple-500/10 text-purple-400',
          featureBg: 'bg-purple-500/20 text-purple-300',
          backgroundEffect: 'bg-purple-500/10'
        };
    }
  };

  const colors = getColorClasses(colorScheme);

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl ${colors.card} backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileHover={{ y: -5 }}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${colors.iconBg}`}>
            {icon}
          </div>
          <div className={`p-2 ${colors.settingsIcon} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            <Settings className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-200">
            {title}
          </h3>
          {desc && <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>}

          {features && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Features:</h4>
              <div className="flex flex-wrap gap-1">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs ${colors.featureBg} rounded-full`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <motion.button
          onClick={generateConfig}
          className={`w-full inline-flex items-center justify-center rounded-xl ${buttonColor} text-white px-4 py-3 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Config
        </motion.button>
      </div>

      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.backgroundEffect} rounded-full blur-xl -translate-y-16 translate-x-16`}></div>
    </motion.div>
  );
}

export default Config;