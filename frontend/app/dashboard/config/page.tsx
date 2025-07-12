/* eslint-disable jsx-a11y/alt-text */
"use client";

import { useState } from "react";
import type { ConfigType } from "@/typings";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Download, Image, Link, PencilIcon, Settings, Zap, CheckCircle, AlertCircle } from "lucide-react";
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#171619]/90 via-[#1a1d1d]/80 to-[#171619]/70 backdrop-blur-xl border border-zinc-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-pink-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }}></div>

              <div className="absolute top-10 right-20 w-4 h-4 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-20 left-32 w-3 h-3 bg-pink-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute bottom-20 right-32 w-5 h-5 bg-indigo-400/30 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <motion.div
                    className="flex items-center space-x-4 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Config Generator:</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-400">Ready</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <h1 className="text-4xl lg:text-6xl font-bold">
                      <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                        ShareX Config
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-pink-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Generator
                      </span>
                    </h1>

                    <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                      Generate ShareX configurations for uploading files, shortening URLs, and sharing text snippets.
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  className="grid grid-cols-2 gap-4 min-w-[300px]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 backdrop-blur-sm border border-purple-500/40 p-4 shadow-xl group"
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-500/30 rounded-lg">
                          <Settings className="w-5 h-5 text-purple-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-purple-300 font-medium">Available</div>
                          <div className="text-lg font-bold text-white">
                            3
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/30 to-pink-600/20 backdrop-blur-sm border border-pink-500/40 p-4 shadow-xl group"
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-pink-500/30 rounded-lg">
                          <Zap className="w-5 h-5 text-pink-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-pink-300 font-medium">Domain</div>
                          <div className="text-lg font-bold text-white truncate">
                            {user.domain}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 backdrop-blur-sm border border-indigo-500/40 p-4 shadow-xl group"
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-indigo-500/30 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-indigo-300 font-medium">Status</div>
                          <div className="text-lg font-bold text-white">
                            Ready
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/40 p-4 shadow-xl group"
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-emerald-500/30 rounded-lg">
                          <Download className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-emerald-300 font-medium">Format</div>
                          <div className="text-lg font-bold text-white">
                            .sxcu
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                className="mt-8 pt-6 border-t border-zinc-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-400">Generator Status: </span>
                      <span className="text-sm font-medium text-green-400">All configs available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">ShareX Version: </span>
                      <span className="text-sm font-medium text-white">Compatible</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                      <Download className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">
                        3 configurations ready
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
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