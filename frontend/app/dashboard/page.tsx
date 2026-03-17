/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Upload, ApiResponse, UserState } from "@/typings";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { formatFileSize } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CopyIcon,
  Eye,
  Trash2,
  Search,
  TrendingUp,
  FileImage,
  Calendar,
  Activity,
  LayoutGrid,
  LayoutList,
  Terminal,
} from "lucide-react";
import { toast } from "react-hot-toast";

const fetchImages = async (
  apiToken: string,
  setUploads: (uploads: Upload[]) => void,
  setLoading: (loading: boolean) => void,
): Promise<void> => {
  try {
    const response = await fetch("/api/uploads", {
      headers: { key: apiToken },
      method: "GET",
    });
    const data: ApiResponse = await response.json();
    setUploads(data.uploads || []);
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch images");
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (
  apiToken: string,
  fileName: string,
  removeUpload: (f: string) => void,
  user: UserState,
): Promise<void> => {
  try {
    const r = await fetch(`/api/delete-upload/${fileName}`, {
      headers: { key: apiToken },
      method: "DELETE",
    });
    if (r.ok) {
      removeUpload(fileName);
      toast.success("File deleted.");
      fetchImages(user.apiToken, user.setUploads, user.setLoading);
    } else {
      const e = await r.json();
      toast.error("Failed to delete: " + (e.message || "Unknown error"));
    }
  } catch {
    toast.error("Error deleting image");
  }
};

const StatCard = ({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  color: string;
}) => {
  const c = (
    {
      violet: {
        border: "rgba(139,92,246,0.25)",
        bg: "rgba(139,92,246,0.08)",
        text: "#a78bfa",
      },
      pink: {
        border: "rgba(236,72,153,0.25)",
        bg: "rgba(236,72,153,0.08)",
        text: "#f472b6",
      },
      indigo: {
        border: "rgba(99,102,241,0.25)",
        bg: "rgba(99,102,241,0.08)",
        text: "#818cf8",
      },
      emerald: {
        border: "rgba(16,185,129,0.25)",
        bg: "rgba(16,185,129,0.08)",
        text: "#34d399",
      },
    } as Record<string, { border: string; bg: string; text: string }>
  )[color];
  return (
    <div
      className="rounded-sm p-4 space-y-1"
      style={{ border: `1px solid ${c.border}`, backgroundColor: c.bg }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: c.text }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{ color: "#f4f4f5" }}
      >
        {value}
      </p>
      {sub && (
        <div className="text-xs" style={{ color: "#71717a" }}>
          {sub}
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 25;

  if (!user.apiToken) return <Unauthenticated />;

  const filtered = user.uploads.filter((u) =>
    u.fileName.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageStart = (currentPage - 1) * perPage;
  const paginatedUploads = filtered.slice(pageStart, pageStart + perPage);
  const totalFiles = user.uploads.length;
  const totalViews = user.uploads.reduce((a, i) => a + i.metadata.views, 0);
  const totalStorage = user.uploads.reduce(
    (a, i) => a + i.metadata.fileSize,
    0,
  );
  const recentUploads = user.uploads.filter((u) => {
    const d = new Date(u.metadata.uploadDate),
      w = new Date();
    w.setDate(w.getDate() - 7);
    return d > w;
  }).length;

  useEffect(() => {
    fetchImages(user.apiToken, user.setUploads, user.setLoading);
    const id = setInterval(
      () => fetchImages(user.apiToken, user.setUploads, user.setLoading),
      10000,
    );
    return () => clearInterval(id);
  }, [user.apiToken, user.setUploads, user.setLoading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#06060e" }}
    >
      {/* Sidebar is fixed z-20, sits above everything */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((s) => !s)}
      />

      {/*
        paddingLeft reserves the sidebar column.
        Sidebar is z-20, main is default stacking — no z-index needed.
        This gives correct width AND clickable sidebar.
      */}
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
                  dashboard · {user.displayName}
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
                    live
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: "#f4f4f5" }}
                  >
                    Welcome back,{" "}
                    <span className="text-violet-400">{user.displayName}</span>
                  </h1>
                  <p className="mt-1 text-sm" style={{ color: "#71717a" }}>
                    Overview of your uploads and account activity.
                  </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    label="Storage Used"
                    value={formatFileSize(totalStorage)}
                    color="violet"
                  />
                  <StatCard
                    label="Total Files"
                    value={totalFiles.toLocaleString()}
                    sub={
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />+{recentUploads} this
                        week
                      </span>
                    }
                    color="pink"
                  />
                  <StatCard
                    label="Total Views"
                    value={totalViews.toLocaleString()}
                    sub={`avg ${totalFiles > 0 ? Math.round(totalViews / totalFiles) : 0} per file`}
                    color="indigo"
                  />
                  <StatCard
                    label="This Week"
                    value={recentUploads}
                    sub={
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        recent uploads
                      </span>
                    }
                    color="emerald"
                  />
                </div>
              </div>
              <div
                className="px-5 py-2.5 flex items-center gap-4"
                style={{
                  borderTop: "1px solid rgba(139,92,246,0.1)",
                  backgroundColor: "#0f0f1a",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#4ade80" }}
                  />
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: "#52525b" }}
                  >
                    All systems operational
                  </span>
                </div>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "#3f3f46" }}
                >
                  auto-refresh every 10s
                </span>
              </div>
            </div>
          </motion.div>

          {user.uploads.length > 0 && (
            <motion.div
              className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "#52525b" }}
                />
                <input
                  type="text"
                  placeholder="Search uploads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 font-mono text-sm rounded-sm outline-none transition-all"
                  style={{
                    backgroundColor: "#0a0a12",
                    border: "1px solid rgba(139,92,246,0.2)",
                    color: "#f4f4f5",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(139,92,246,0.45)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)")
                  }
                />
              </div>
              <div
                className="flex rounded-sm overflow-hidden"
                style={{ border: "1px solid rgba(139,92,246,0.2)" }}
              >
                {(["grid", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="flex items-center gap-1.5 px-3 py-2 transition-colors"
                    style={{
                      backgroundColor:
                        viewMode === mode
                          ? "rgba(139,92,246,0.2)"
                          : "transparent",
                      color: viewMode === mode ? "#f4f4f5" : "#52525b",
                    }}
                  >
                    {mode === "grid" ? (
                      <LayoutGrid className="w-3.5 h-3.5" />
                    ) : (
                      <LayoutList className="w-3.5 h-3.5" />
                    )}
                    <span className="font-mono text-xs capitalize">{mode}</span>
                  </button>
                ))}
              </div>
              <span
                className="font-mono text-xs ml-auto"
                style={{ color: "#3f3f46" }}
              >
                {filtered.length} / {user.uploads.length} files · page {currentPage}/{totalPages}
              </span>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <FileImage className="w-4 h-4 text-violet-400" />
              <h2
                className="text-sm font-semibold tracking-tight"
                style={{ color: "#a1a1aa" }}
              >
                Your Uploads
              </h2>
              {searchTerm && (
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded-sm"
                  style={{
                    backgroundColor: "rgba(139,92,246,0.1)",
                    color: "#8b5cf6",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}
                >
                  filtered: &quot;{searchTerm}&quot;
                </span>
              )}
            </div>

            {user.loading ? (
              <div
                className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "grid-cols-1"}`}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-sm animate-pulse overflow-hidden"
                    style={{
                      border: "1px solid rgba(139,92,246,0.1)",
                      backgroundColor: "#0a0a12",
                    }}
                  >
                    <div
                      className={`${viewMode === "grid" ? "h-44" : "h-16"} w-full`}
                      style={{ backgroundColor: "#0f0f1a" }}
                    />
                    <div className="p-3 space-y-2">
                      <div
                        className="h-3 w-3/4 rounded-sm"
                        style={{ backgroundColor: "#0f0f1a" }}
                      />
                      <div
                        className="h-2.5 w-1/2 rounded-sm"
                        style={{ backgroundColor: "#0f0f1a" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 rounded-sm"
                style={{
                  border: "1px solid rgba(139,92,246,0.12)",
                  backgroundColor: "#0a0a12",
                }}
              >
                <AlertCircle
                  className="w-10 h-10 mb-3"
                  style={{ color: "#3f3f46" }}
                />
                <p className="font-semibold" style={{ color: "#a1a1aa" }}>
                  {searchTerm ? "No results found" : "No uploads yet"}
                </p>
                <p className="text-sm mt-1" style={{ color: "#52525b" }}>
                  {searchTerm
                    ? "Try adjusting your search"
                    : "Upload your first file to get started"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 font-mono text-xs px-3 py-1.5 rounded-sm transition-colors"
                    style={{
                      border: "1px solid rgba(139,92,246,0.2)",
                      backgroundColor: "rgba(139,92,246,0.08)",
                      color: "#8b5cf6",
                    }}
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "grid-cols-1"}`}
              >
                {paginatedUploads.map((image: Upload, index) => (
                  <motion.div
                    key={image.fileName}
                    className={`group relative rounded-sm overflow-hidden transition-all duration-200 ${viewMode === "list" ? "flex items-center" : ""}`}
                    style={{
                      border: "1px solid rgba(139,92,246,0.15)",
                      backgroundColor: "#0a0a12",
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(139,92,246,0.4)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(139,92,246,0.15)")
                    }
                  >
                    <div
                      className={`relative overflow-hidden ${viewMode === "list" ? "w-24 h-16 flex-shrink-0" : ""}`}
                    >
                      <img
                        src={`https://s3.tritan.gg/images/${image.fileName}`}
                        alt={image.fileName}
                        className={`${viewMode === "grid" ? "h-44" : "h-16"} w-full object-cover transition-transform duration-300 group-hover:scale-105`}
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ backgroundColor: "rgba(6,6,14,0.7)" }}
                      >
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://${user.domain}/i/${image.fileName.split(".").slice(0, -1).join(".")}`,
                            );
                            toast.success("URL copied!");
                          }}
                          className="p-1.5 rounded-sm"
                          style={{
                            border: "1px solid rgba(139,92,246,0.4)",
                            backgroundColor: "rgba(139,92,246,0.2)",
                            color: "#a78bfa",
                          }}
                        >
                          <CopyIcon className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`https://${user.domain}/i/${image.fileName.split(".").slice(0, -1).join(".")}`}
                          prefetch={false}
                        >
                          <button
                            className="p-1.5 rounded-sm"
                            style={{
                              border: "1px solid rgba(99,102,241,0.4)",
                              backgroundColor: "rgba(99,102,241,0.2)",
                              color: "#818cf8",
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(
                              user.apiToken,
                              image.fileName.split(".").slice(0, -1).join("."),
                              user.removeUpload,
                              user,
                            )
                          }
                          className="p-1.5 rounded-sm"
                          style={{
                            border: "1px solid rgba(239,68,68,0.3)",
                            backgroundColor: "rgba(239,68,68,0.12)",
                            color: "#f87171",
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-2.5 space-y-1.5 ${viewMode === "list" ? "flex-1 flex items-center gap-6" : ""}`}
                    >
                      <h3
                        className="font-mono text-xs truncate"
                        style={{ color: "#a1a1aa" }}
                      >
                        <Link
                          href={`https://${user.domain}/i/${image.fileName.split(".").slice(0, -1).join(".")}`}
                          prefetch={false}
                        >
                          {image.fileName}
                        </Link>
                      </h3>
                      <div
                        className={`flex items-center gap-3 ${viewMode === "list" ? "ml-auto flex-shrink-0" : ""}`}
                      >
                        <span
                          className="flex items-center gap-1 font-mono text-[10px]"
                          style={{ color: "#52525b" }}
                        >
                          <Calendar className="w-3 h-3" />
                          {new Date(
                            image.metadata.uploadDate,
                          ).toLocaleDateString()}
                        </span>
                        <span
                          className="flex items-center gap-1 font-mono text-[10px]"
                          style={{ color: "#52525b" }}
                        >
                          <Eye className="w-3 h-3" />
                          {image.metadata.views}
                        </span>
                        <span
                          className="font-mono text-[10px]"
                          style={{ color: "#4ade80" }}
                        >
                          {formatFileSize(image.metadata.fileSize)}
                        </span>
                        <span
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm uppercase"
                          style={{
                            backgroundColor: "rgba(139,92,246,0.1)",
                            color: "#8b5cf6",
                            border: "1px solid rgba(139,92,246,0.15)",
                          }}
                        >
                          {image.fileName.split(".").pop()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!user.loading && filtered.length > 0 && totalPages > 1 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-sm font-mono text-xs transition-colors disabled:opacity-50"
                  style={{
                    border: "1px solid rgba(139,92,246,0.2)",
                    backgroundColor: "rgba(139,92,246,0.08)",
                    color: "#a78bfa",
                  }}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className="px-2.5 py-1.5 rounded-sm font-mono text-xs transition-colors"
                      style={{
                        border: "1px solid rgba(139,92,246,0.2)",
                        backgroundColor:
                          currentPage === page
                            ? "rgba(139,92,246,0.2)"
                            : "transparent",
                        color: currentPage === page ? "#f4f4f5" : "#a1a1aa",
                      }}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-sm font-mono text-xs transition-colors disabled:opacity-50"
                  style={{
                    border: "1px solid rgba(139,92,246,0.2)",
                    backgroundColor: "rgba(139,92,246,0.08)",
                    color: "#a78bfa",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
