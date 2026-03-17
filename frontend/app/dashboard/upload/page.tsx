"use client";

import { useState, useRef, DragEvent } from "react";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import {
  FileUp,
  Upload,
  Image,
  Video,
  FileText,
  Cloud,
  CheckCircle,
  AlertCircle,
  Terminal,
} from "lucide-react";
import { toast } from "react-hot-toast";

const UploadPage: React.FC = () => {
  const user = useUser();
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  if (!user.apiToken) return <Unauthenticated />;

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0)
      await uploadFile(e.dataTransfer.files[0]);
  };

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    input.accept = "image/*,video/*,.pdf,.txt,.doc,.docx,.zip,.rar";
    input.onchange = async () => {
      if (input.files?.[0]) await uploadFile(input.files[0]);
    };
    input.click();
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadDone(false);
    const formData = new FormData();
    formData.append("sharex", file);
    try {
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 90) {
            clearInterval(interval);
            return p;
          }
          return p + 10;
        });
      }, 120);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: { key: user.apiToken },
      });
      clearInterval(interval);
      setUploadProgress(100);
      if (response.ok) {
        setUploadDone(true);
        toast.success("File uploaded successfully!");
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadDone(false);
        }, 2000);
      } else {
        toast.error("Error uploading file");
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fmt = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024,
      s = ["B", "KB", "MB", "GB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + s[i];
  };

  const totalStorage = user.uploads.reduce(
    (a, u) => a + u.metadata.fileSize,
    0,
  );
  const totalViews = user.uploads.reduce((a, u) => a + u.metadata.views, 0);

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
                  upload · file-host
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
              <div className="p-6 space-y-4">
                <div>
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "#f4f4f5" }}
                  >
                    Upload Media
                  </h1>
                  <p className="mt-1 text-sm" style={{ color: "#71717a" }}>
                    Drag and drop or click to upload images, videos, documents,
                    and archives.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total Files",
                      value: user.uploads.length.toLocaleString(),
                      border: "rgba(139,92,246,0.2)",
                      bg: "rgba(139,92,246,0.08)",
                      text: "#a78bfa",
                    },
                    {
                      label: "Storage Used",
                      value: fmt(totalStorage),
                      border: "rgba(236,72,153,0.2)",
                      bg: "rgba(236,72,153,0.08)",
                      text: "#f472b6",
                    },
                    {
                      label: "Total Views",
                      value: totalViews.toLocaleString(),
                      border: "rgba(99,102,241,0.2)",
                      bg: "rgba(99,102,241,0.08)",
                      text: "#818cf8",
                    },
                    {
                      label: "Max Size",
                      value: "100 MB",
                      border: "rgba(16,185,129,0.2)",
                      bg: "rgba(16,185,129,0.08)",
                      text: "#34d399",
                    },
                  ].map(({ label, value, border, bg, text }) => (
                    <div
                      key={label}
                      className="rounded-sm p-3 space-y-0.5"
                      style={{
                        border: `1px solid ${border}`,
                        backgroundColor: bg,
                      }}
                    >
                      <p
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: text }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-lg font-bold tracking-tight"
                        style={{ color: "#f4f4f5" }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="px-5 py-2.5 flex items-center gap-2"
                style={{
                  borderTop: "1px solid rgba(139,92,246,0.1)",
                  backgroundColor: "#0f0f1a",
                }}
              >
                <Cloud className="w-3 h-3" style={{ color: "#3f3f46" }} />
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "#3f3f46" }}
                >
                  Storage: Unlimited · Auto-scanned for malware
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              ref={dropzoneRef}
              onClick={!isUploading ? handleClick : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className="relative flex flex-col items-center justify-center h-72 rounded-sm cursor-pointer transition-all duration-200"
              style={{
                border: isDragging
                  ? "1px dashed rgba(139,92,246,0.7)"
                  : "1px dashed rgba(139,92,246,0.25)",
                backgroundColor: isDragging
                  ? "rgba(139,92,246,0.06)"
                  : "#0a0a12",
              }}
              onMouseEnter={(e) => {
                if (!isUploading && !isDragging) {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.45)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(139,92,246,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
                  e.currentTarget.style.backgroundColor = "#0a0a12";
                }
              }}
            >
              {!isUploading ? (
                <div className="flex flex-col items-center gap-4 text-center px-6">
                  <div
                    className="w-14 h-14 rounded-sm flex items-center justify-center"
                    style={{
                      border: "1px solid rgba(139,92,246,0.25)",
                      backgroundColor: "rgba(139,92,246,0.1)",
                    }}
                  >
                    <FileUp className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <p
                      className="font-semibold"
                      style={{ color: isDragging ? "#a78bfa" : "#f4f4f5" }}
                    >
                      {isDragging
                        ? "Release to upload"
                        : "Drag files here or click to browse"}
                    </p>
                    <p className="text-sm" style={{ color: "#52525b" }}>
                      Images, videos, documents · Max 100MB
                    </p>
                  </div>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold"
                    style={{
                      border: "1px solid rgba(139,92,246,0.3)",
                      backgroundColor: "rgba(139,92,246,0.15)",
                      color: "#f4f4f5",
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Select Files
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-5 w-full max-w-xs px-6">
                  {uploadDone ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                      <p className="font-semibold" style={{ color: "#4ade80" }}>
                        Upload complete!
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <Cloud className="w-8 h-8 text-violet-400 animate-pulse" />
                      <div className="w-full space-y-2">
                        <div className="flex justify-between items-center">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "#f4f4f5" }}
                          >
                            Uploading...
                          </p>
                          <span
                            className="font-mono text-xs"
                            style={{ color: "#8b5cf6" }}
                          >
                            {uploadProgress}%
                          </span>
                        </div>
                        <div
                          className="w-full h-1 rounded-sm overflow-hidden"
                          style={{ backgroundColor: "rgba(139,92,246,0.15)" }}
                        >
                          <motion.div
                            className="h-full rounded-sm"
                            style={{ backgroundColor: "#8b5cf6" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2"
          >
            {[
              {
                icon: <Image className="w-3.5 h-3.5 text-blue-400" />,
                label: "Images",
                exts: "JPG PNG GIF WEBP",
              },
              {
                icon: <Video className="w-3.5 h-3.5 text-emerald-400" />,
                label: "Videos",
                exts: "MP4 WEBM AVI",
              },
              {
                icon: <FileText className="w-3.5 h-3.5 text-violet-400" />,
                label: "Documents",
                exts: "PDF TXT DOC ZIP",
              },
            ].map(({ icon, label, exts }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2 rounded-sm"
                style={{
                  border: "1px solid rgba(139,92,246,0.12)",
                  backgroundColor: "#0a0a12",
                }}
              >
                {icon}
                <span
                  className="text-sm font-medium"
                  style={{ color: "#a1a1aa" }}
                >
                  {label}
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "#3f3f46" }}
                >
                  {exts}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="rounded-sm overflow-hidden"
              style={{
                border: "1px solid rgba(234,179,8,0.15)",
                backgroundColor: "#0a0a12",
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  borderBottom: "1px solid rgba(234,179,8,0.1)",
                  backgroundColor: "rgba(234,179,8,0.04)",
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: "#ca8a04" }}
                >
                  Upload Guidelines
                </span>
              </div>
              <div className="p-4">
                <ul className="space-y-1.5">
                  {[
                    "Maximum file size: 100MB per file",
                    "Files are automatically scanned for malware",
                    "No copyrighted content or illegal material",
                    "Files may be removed after 30 days of inactivity",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span
                        className="mt-1.5 w-1 h-1 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: "#52525b" }}
                      />
                      <span style={{ color: "#71717a" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
