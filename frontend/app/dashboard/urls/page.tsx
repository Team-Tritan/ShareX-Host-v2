/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Url, ApiResponseUrl } from "@/typings";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import Prompter from "@/components/Prompt";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  AlertCircle,
  ChevronRight,
  CopyIcon,
  Edit3,
  Eye,
  Trash2,
  Plus,
  LinkIcon,
  BarChart3,
  Calendar,
  Search,
  Terminal,
  TrendingUp,
} from "lucide-react";

const fetchUrls = async (
  apiToken: string,
  setUrls: (u: Url[]) => void,
  setLoading: (l: boolean) => void,
) => {
  try {
    const r = await fetch("/api/urls", {
      headers: { key: apiToken },
      method: "GET",
    });
    const d: ApiResponseUrl = await r.json();
    setUrls(d.urls || []);
  } catch {
    toast.error("Failed to fetch URLs");
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (
  apiToken: string,
  slug: string,
  removeUrl: (s: string) => void,
) => {
  try {
    const r = await fetch(`/api/delete-url/${slug}`, {
      headers: { key: apiToken },
      method: "DELETE",
    });
    if (r.ok) {
      removeUrl(slug);
      toast.success("URL deleted.");
    } else {
      const e = await r.json();
      toast.error("Delete failed: " + (e.message || "Unknown error"));
    }
  } catch {
    toast.error("Error deleting URL");
  }
};

const Urls: React.FC = () => {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editUrl, setEditUrl] = useState<Url | null>(null);
  const [createUrlOpen, setCreateUrlOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  if (!user.apiToken) return <Unauthenticated />;

  useEffect(() => {
    fetchUrls(user.apiToken, user.setUrls, user.setLoading);
    const id = setInterval(
      () => fetchUrls(user.apiToken, user.setUrls, user.setLoading),
      10000,
    );
    return () => clearInterval(id);
  }, [user.apiToken, user.setUrls, user.setLoading]);

  const handleUpdateSlug = async (newSlug: string) => {
    if (!editUrl || newSlug === editUrl.slug) return setEditUrl(null);
    try {
      const r = await fetch(`/api/url/${editUrl.slug}`, {
        headers: { key: user.apiToken, "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ new_slug: newSlug }),
      });
      if (r.status === 200) {
        user.updateUrl(editUrl.key, newSlug);
        toast.success("Slug updated.");
      } else if (r.status === 409) toast.error("Slug already taken.");
      else toast.error("Error updating slug.");
    } catch {
      toast.error("Error updating slug.");
    } finally {
      setEditUrl(null);
    }
  };

  const handleShortenUrl = async (newUrl: string) => {
    setCreateUrlOpen(false);
    if (!newUrl) return toast.error("URL cannot be empty.");
    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://"))
      return toast.error("URL must start with http:// or https://");
    try {
      const r = await fetch("/api/url", {
        headers: { key: user.apiToken, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ url: newUrl }),
      });
      if (r.ok) {
        toast.success("URL created!");
        fetchUrls(user.apiToken, user.setUrls, user.setLoading);
      } else toast.error("Failed to create URL.");
    } catch {
      toast.error("Error creating URL.");
    }
  };

  const filtered = user.urls.filter(
    (u) =>
      u.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalClicks = user.urls.reduce((s, u) => s + u.clicks, 0);
  const thisMonth = user.urls.filter((u) => {
    const d = new Date(u.createdAt),
      n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

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
        <div className="p-6 space-y-5">
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
                  urls · shortener
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
                    active
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "#f4f4f5" }}
                  >
                    URL Shortener
                  </h1>
                  <p className="mt-1 text-sm" style={{ color: "#71717a" }}>
                    Create, manage, and track shortened URLs with custom slugs
                    and click analytics.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total URLs",
                      value: user.urls.length,
                      border: "rgba(139,92,246,0.2)",
                      bg: "rgba(139,92,246,0.08)",
                      text: "#a78bfa",
                    },
                    {
                      label: "Total Clicks",
                      value: totalClicks,
                      border: "rgba(236,72,153,0.2)",
                      bg: "rgba(236,72,153,0.08)",
                      text: "#f472b6",
                    },
                    {
                      label: "Avg. Clicks",
                      value:
                        user.urls.length > 0
                          ? Math.round(totalClicks / user.urls.length)
                          : 0,
                      border: "rgba(99,102,241,0.2)",
                      bg: "rgba(99,102,241,0.08)",
                      text: "#818cf8",
                    },
                    {
                      label: "This Month",
                      value: thisMonth,
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
                        className="text-xl font-bold tracking-tight"
                        style={{ color: "#f4f4f5" }}
                      >
                        {value.toLocaleString()}
                      </p>
                    </div>
                  ))}
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
                    All systems operational · {user.domain}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
          >
            <button
              onClick={() => setCreateUrlOpen(true)}
              className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-sm transition-colors"
              style={{
                border: "1px solid rgba(139,92,246,0.35)",
                backgroundColor: "rgba(139,92,246,0.2)",
                color: "#fff",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(139,92,246,0.28)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.2)")
              }
            >
              <Plus className="w-4 h-4" />
              New Short URL
            </button>
            {user.urls.length > 0 && (
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "#52525b" }}
                />
                <input
                  type="text"
                  placeholder="Search by slug or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 font-mono text-sm rounded-sm outline-none transition-all"
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
            )}
            <span
              className="font-mono text-xs sm:ml-auto"
              style={{ color: "#3f3f46" }}
            >
              {filtered.length} / {user.urls.length} urls
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="w-4 h-4 text-violet-400" />
              <h2
                className="text-sm font-semibold"
                style={{ color: "#a1a1aa" }}
              >
                Your URLs
              </h2>
            </div>

            {user.loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-sm overflow-hidden animate-pulse"
                    style={{
                      border: "1px solid rgba(139,92,246,0.1)",
                      backgroundColor: "#0a0a12",
                    }}
                  >
                    <div
                      className="h-28 w-full"
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
                  {user.urls.length === 0 ? "No URLs yet" : "No results found"}
                </p>
                <p className="text-sm mt-1" style={{ color: "#52525b" }}>
                  {user.urls.length === 0
                    ? "Create your first short URL to get started"
                    : "Try adjusting your search"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((url, index) => (
                  <motion.div
                    key={url.slug}
                    className="group rounded-sm overflow-hidden transition-all duration-200"
                    style={{
                      border: "1px solid rgba(139,92,246,0.15)",
                      backgroundColor: "#0a0a12",
                    }}
                    initial={{ opacity: 0, y: 6 }}
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
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        borderBottom: "1px solid rgba(139,92,246,0.1)",
                        backgroundColor: "#0f0f1a",
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(139,92,246,0.15)" }}
                        >
                          <LinkIcon className="w-3 h-3 text-violet-400" />
                        </div>
                        <Link
                          href={`https://${user.domain}/u/${url.slug}`}
                          className="font-mono text-sm font-semibold truncate"
                          style={{ color: "#f4f4f5" }}
                          prefetch={false}
                        >
                          /{url.slug}
                        </Link>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://${user.domain}/u/${url.slug}`,
                            );
                            toast.success("URL copied!");
                          }}
                          className="p-1.5 rounded-sm"
                          style={{
                            border: "1px solid rgba(139,92,246,0.2)",
                            backgroundColor: "rgba(139,92,246,0.1)",
                            color: "#a78bfa",
                          }}
                        >
                          <CopyIcon className="w-3 h-3" />
                        </button>
                        <Link
                          href={`https://${user.domain}/u/${url.slug}`}
                          prefetch={false}
                        >
                          <button
                            className="p-1.5 rounded-sm"
                            style={{
                              border: "1px solid rgba(99,102,241,0.2)",
                              backgroundColor: "rgba(99,102,241,0.1)",
                              color: "#818cf8",
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            setEditUrl({
                              key: url.key,
                              url: "",
                              createdAt: "",
                              ip: "",
                              slug: url.slug,
                              clicks: 0,
                            })
                          }
                          className="p-1.5 rounded-sm"
                          style={{
                            border: "1px solid rgba(236,72,153,0.2)",
                            backgroundColor: "rgba(236,72,153,0.1)",
                            color: "#f472b6",
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              user.apiToken,
                              url.slug,
                              user.removeUrl,
                            )
                          }
                          className="p-1.5 rounded-sm"
                          style={{
                            border: "1px solid rgba(239,68,68,0.2)",
                            backgroundColor: "rgba(239,68,68,0.1)",
                            color: "#f87171",
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-3">
                      <div className="flex items-start gap-1.5">
                        <ChevronRight
                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                          style={{ color: "#3f3f46" }}
                        />
                        <Link
                          href={url.url}
                          className="font-mono text-xs truncate block"
                          style={{ color: "#52525b" }}
                          prefetch={false}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#a1a1aa")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#52525b")
                          }
                        >
                          {url.url}
                        </Link>
                      </div>
                      <div
                        className="flex items-center justify-between pt-2"
                        style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="flex items-center gap-1 font-mono text-[10px]"
                            style={{ color: "#52525b" }}
                          >
                            <BarChart3 className="w-3 h-3 text-pink-400" />
                            <span style={{ color: "#f472b6" }}>
                              {url.clicks}
                            </span>{" "}
                            clicks
                          </span>
                          <span
                            className="flex items-center gap-1 font-mono text-[10px]"
                            style={{ color: "#52525b" }}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(url.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {url.clicks > 0 && (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {editUrl && (
        <Prompter
          title="Edit Slug"
          message="Enter new slug:"
          onConfirm={handleUpdateSlug}
          onCancel={() => setEditUrl(null)}
        />
      )}
      {createUrlOpen && (
        <Prompter
          title="Shorten URL"
          message="Enter the URL to shorten:"
          onConfirm={handleShortenUrl}
          onCancel={() => setCreateUrlOpen(false)}
        />
      )}
    </div>
  );
};

export default Urls;
