"use client";

import { useState } from "react";
import type { ConfigType } from "@/typings";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import {
  Download,
  Image as ImageIcon,
  Link,
  PencilIcon,
  Settings,
  Terminal,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Config: React.FC = () => {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [downloading, setDownloading] = useState<ConfigType | "all" | null>(
    null,
  );

  if (!user.apiToken) return <Unauthenticated />;

  const generateConfig = async (type: ConfigType) => {
    setDownloading(type);
    try {
      const response = await fetch(`/api/config?type=${type}`, {
        headers: { key: user.apiToken },
        method: "POST",
      });
      let data = await response.json();
      if (typeof data === "object") data = JSON.stringify(data, null, 2);
      const fileName =
        type === "upload"
          ? "sharex-img-config.sxcu"
          : type === "url"
            ? "sharex-shortener-config.sxcu"
            : "sharex-text-config.sxcu";
      const blob = new Blob([data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${fileName} downloaded.`);
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setDownloading(null);
    }
  };

  const downloadAllConfigs = async () => {
    setDownloading("all");
    for (const type of ["upload", "url", "text"] as ConfigType[])
      await generateConfig(type);
    setDownloading(null);
  };

  const configs = [
    {
      type: "upload" as ConfigType,
      title: "Images & Files",
      icon: <ImageIcon className="w-5 h-5" />,
      file: "sharex-img-config.sxcu",
      features: ["Images", "Videos", "Documents", "Archives"],
      color: "violet",
    },
    {
      type: "url" as ConfigType,
      title: "URL Shortener",
      icon: <Link className="w-5 h-5" />,
      file: "sharex-shortener-config.sxcu",
      features: [
        "URL Shortening",
        "Analytics",
        "Custom Slugs",
        "Click Tracking",
      ],
      color: "pink",
    },
    {
      type: "text" as ConfigType,
      title: "Pastebin",
      icon: <PencilIcon className="w-5 h-5" />,
      file: "sharex-text-config.sxcu",
      features: [
        "Text Uploads",
        "Code Snippets",
        "Syntax Highlight",
        "Sharing",
      ],
      color: "indigo",
    },
  ];

  const ct: Record<
    string,
    { border: string; bg: string; text: string; iconBg: string }
  > = {
    violet: {
      border: "rgba(139,92,246,0.25)",
      bg: "rgba(139,92,246,0.06)",
      text: "#a78bfa",
      iconBg: "rgba(139,92,246,0.15)",
    },
    pink: {
      border: "rgba(236,72,153,0.25)",
      bg: "rgba(236,72,153,0.06)",
      text: "#f472b6",
      iconBg: "rgba(236,72,153,0.15)",
    },
    indigo: {
      border: "rgba(99,102,241,0.25)",
      bg: "rgba(99,102,241,0.06)",
      text: "#818cf8",
      iconBg: "rgba(99,102,241,0.15)",
    },
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#06060e" }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((s) => !s)}
      />
      <main
        className="min-h-screen transition-all duration-300"
        style={{ paddingLeft: sidebarOpen ? "16rem" : "0" }}
      >
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="rounded-sm overflow-hidden"
              style={{
                border: "1px solid rgba(139,92,246,0.2)",
                backgroundColor: "#0a0a12",
              }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{
                  borderBottom: "1px solid rgba(139,92,246,0.12)",
                  backgroundColor: "#0f0f1a",
                }}
              >
                <Terminal className="w-3.5 h-3.5 text-violet-400" />
                <span
                  className="font-mono text-xs"
                  style={{ color: "#52525b" }}
                >
                  sharex · config-generator
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: "#4ade80" }}
                  />
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: "#4ade80" }}
                  >
                    ready
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "#f4f4f5" }}
                  >
                    ShareX Config Generator
                  </h1>
                  <p className="text-sm" style={{ color: "#71717a" }}>
                    Generate{" "}
                    <span
                      className="font-mono text-xs"
                      style={{ color: "#8b5cf6" }}
                    >
                      .sxcu
                    </span>{" "}
                    files for uploading, URL shortening, and text sharing.
                  </p>
                </div>
                <button
                  onClick={downloadAllConfigs}
                  disabled={downloading !== null}
                  className="group flex-shrink-0 inline-flex items-center gap-2.5 font-semibold text-sm px-5 py-2.5 rounded-sm transition-colors disabled:opacity-60"
                  style={{
                    border: "1px solid rgba(139,92,246,0.35)",
                    backgroundColor: "rgba(139,92,246,0.2)",
                    color: "#fff",
                  }}
                  onMouseEnter={(e) => {
                    if (!downloading)
                      e.currentTarget.style.backgroundColor =
                        "rgba(139,92,246,0.28)";
                  }}
                  onMouseLeave={(e) => {
                    if (!downloading)
                      e.currentTarget.style.backgroundColor =
                        "rgba(139,92,246,0.2)";
                  }}
                >
                  {downloading === "all" ? (
                    <>
                      <div
                        className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                        style={{
                          borderColor: "rgba(139,92,246,0.3)",
                          borderTopColor: "#8b5cf6",
                        }}
                      />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download All
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              <div
                className="px-5 py-2.5 flex items-center gap-6"
                style={{
                  borderTop: "1px solid rgba(139,92,246,0.1)",
                  backgroundColor: "#0f0f1a",
                }}
              >
                {[
                  { label: "Configs", value: "3 available" },
                  { label: "Domain", value: user.domain },
                  { label: "Format", value: ".sxcu / JSON" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: "#3f3f46" }}
                    >
                      {label}:
                    </span>
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: "#a1a1aa" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {configs.map(({ type, title, icon, file, features, color }, i) => {
              const c = ct[color];
              return (
                <motion.div
                  key={type}
                  className="rounded-sm overflow-hidden"
                  style={{
                    border: `1px solid ${c.border}`,
                    backgroundColor: "#0a0a12",
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      borderBottom: `1px solid ${c.border}`,
                      backgroundColor: c.bg,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-sm flex items-center justify-center"
                      style={{ backgroundColor: c.iconBg, color: c.text }}
                    >
                      {icon}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#f4f4f5" }}
                      >
                        {title}
                      </p>
                      <p
                        className="font-mono text-[10px]"
                        style={{ color: c.text }}
                      >
                        {file}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {features.map((f) => (
                        <span
                          key={f}
                          className="font-mono text-[10px] px-2 py-0.5 rounded-sm"
                          style={{
                            border: `1px solid ${c.border}`,
                            backgroundColor: c.bg,
                            color: c.text,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => generateConfig(type)}
                      disabled={downloading !== null}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-semibold transition-colors disabled:opacity-50"
                      style={{
                        border: `1px solid ${c.border}`,
                        backgroundColor: "transparent",
                        color: c.text,
                      }}
                      onMouseEnter={(e) => {
                        if (!downloading)
                          e.currentTarget.style.backgroundColor = c.bg;
                      }}
                      onMouseLeave={(e) => {
                        if (downloading !== type)
                          e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {downloading === type ? (
                        <>
                          <div
                            className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                            style={{
                              borderColor: "rgba(255,255,255,0.2)",
                              borderTopColor: c.text,
                            }}
                          />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Config
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div
              className="rounded-sm overflow-hidden"
              style={{
                border: "1px solid rgba(99,102,241,0.2)",
                backgroundColor: "#0a0a12",
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  borderBottom: "1px solid rgba(99,102,241,0.12)",
                  backgroundColor: "rgba(99,102,241,0.06)",
                }}
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: "#818cf8" }}
                >
                  Setup Instructions
                </span>
              </div>
              <div className="p-4 flex gap-3">
                <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <ol className="space-y-1.5">
                  {[
                    "Download the desired .sxcu configuration file(s)",
                    "Double-click the .sxcu file to import it into ShareX",
                    "ShareX will automatically configure the uploader",
                    "Start using ShareX with your Tritan configuration",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span
                        className="flex-shrink-0 font-mono text-[10px] mt-0.5 w-4 h-4 flex items-center justify-center rounded-sm"
                        style={{
                          backgroundColor: "rgba(99,102,241,0.15)",
                          color: "#818cf8",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ color: "#71717a" }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Config;
