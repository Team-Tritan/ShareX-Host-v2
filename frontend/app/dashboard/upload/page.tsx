/* eslint-disable jsx-a11y/alt-text */
"use client";

import { useState, useRef, DragEvent } from "react";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { FileUp, Upload, Image, Video, FileText, Cloud, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const UploadPage: React.FC = () => {
  const user = useUser();
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  if (!user.apiToken) return <Unauthenticated />;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.style.display = "none";
    fileInput.accept = "image/*,video/*,.pdf,.txt,.doc,.docx,.zip,.rar";

    fileInput.onchange = async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        await uploadFile(fileInput.files[0]);
      }
    };

    fileInput.click();
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("sharex", file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          key: user.apiToken,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        toast.success("File uploaded successfully!");
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        toast.error("Error uploading file");
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      toast.error(`Error uploading file: ${error}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0d0c0e] via-[#1a1a1d] to-[#0d0c0e] text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 overflow-auto p-6 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#171619]/90 via-[#1a1a1d]/80 to-[#171619]/70 backdrop-blur-xl border border-zinc-800/50 p-8 shadow-2xl">
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
                        <span className="text-sm text-gray-400">Upload Service:</span>
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
                        Upload Media
                      </span>
                    </h1>

                    <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                      Upload images, videos, documents, and more with our secure file hosting service.
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
                          <Cloud className="w-5 h-5 text-purple-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-purple-300 font-medium">Total Files</div>
                          <div className="text-lg font-bold text-white">
                            {user.uploads.length}
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
                          <FileText className="w-5 h-5 text-pink-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-pink-300 font-medium">Storage Used</div>
                          <div className="text-lg font-bold text-white">
                            {formatFileSize(user.uploads.reduce((acc, upload) => acc + upload.metadata.fileSize, 0))}
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
                          <div className="text-xs text-indigo-300 font-medium">Total Views</div>
                          <div className="text-lg font-bold text-white">
                            {user.uploads.reduce((acc, upload) => acc + upload.metadata.views, 0)}
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
                          <Upload className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-emerald-300 font-medium">Max Size</div>
                          <div className="text-lg font-bold text-white">
                            100MB
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
                      <span className="text-sm text-gray-400">Upload Status: </span>
                      <span className="text-sm font-medium text-green-400">Ready for uploads</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Storage: </span>
                      <span className="text-sm font-medium text-white">Unlimited</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">
                        {user.uploads.length} files uploaded
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div
            ref={dropzoneRef}
            className={`relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-2xl cursor-pointer group transition-all duration-300 ${
              isDragging
                ? "border-purple-500 bg-purple-500/10 scale-105"
                : "border-zinc-600 bg-[#171619]/60 hover:border-purple-500/50 hover:bg-purple-500/5"
            } ${isUploading ? "pointer-events-none" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!isUploading ? handleClick : undefined}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
            
            {!isUploading ? (
              <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                  <Upload className="w-12 h-12 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                  {isDragging ? "Drop your files here" : "Drag and drop files here"}
                </h3>
                <p className="text-gray-400 text-center mb-6 max-w-md">
                  Support for images, videos, documents, and more. Maximum file size: 100MB
                </p>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-sm text-gray-500">or</span>
                </div>
                <motion.button
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileUp className="w-5 h-5 mr-2" />
                  Select Files
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                  <Cloud className="w-12 h-12 text-purple-400 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {uploadProgress === 100 ? "Upload Complete!" : "Uploading..."}
                </h3>
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                {uploadProgress === 100 && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Supported File Types</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#171619]/60 rounded-lg border border-zinc-800/50">
              <Image className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Images</span>
              <span className="text-xs text-gray-500">JPG, PNG, GIF, WEBP</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#171619]/60 rounded-lg border border-zinc-800/50">
              <Video className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Videos</span>
              <span className="text-xs text-gray-500">MP4, WEBM, AVI</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#171619]/60 rounded-lg border border-zinc-800/50">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Documents</span>
              <span className="text-xs text-gray-500">PDF, TXT, DOC, ZIP</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 p-6 bg-[#171619]/60 rounded-2xl border border-zinc-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white mb-2">Upload Guidelines</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Maximum file size: 100MB per file</li>
                <li>• Files are automatically scanned for malware</li>
                <li>• No copyrighted content or illegal material</li>
                <li>• Files may be deleted after 30 days of inactivity</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadPage;