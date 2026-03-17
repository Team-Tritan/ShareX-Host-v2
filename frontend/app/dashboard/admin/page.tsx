/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Shield,
  Terminal,
  AlertCircle,
  Trash2,
  RefreshCw,
  Pencil,
  Users,
  Clock3,
  Layers,
} from "lucide-react";

interface AdminUser {
  key: string;
  admin: boolean;
  displayName: string;
  createdAt: string;
  ip: string;
  domain: string;
}

interface AdminUpload {
  key: string;
  displayName: string;
  fileName: string;
  ip: string;
  metadata: {
    uploadDate: string;
    views: number;
    fileSize: number;
  };
}

interface PaginatedUsersResponse {
  status: number;
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface PaginatedUploadsResponse {
  status: number;
  uploads: AdminUpload[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const USERS_PER_PAGE = 8;
const RECENT_UPLOADS_PER_PAGE = 12;
const USER_UPLOADS_PER_PAGE = 12;

const Pagination = ({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const pages = [] as number[];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-2.5 py-1 rounded-sm font-mono text-[10px] disabled:opacity-50"
        style={{ border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className="px-2.5 py-1 rounded-sm font-mono text-[10px]"
          style={{
            border: "1px solid rgba(139,92,246,0.2)",
            color: p === page ? "#f4f4f5" : "#a1a1aa",
            backgroundColor: p === page ? "rgba(139,92,246,0.2)" : "transparent",
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-2.5 py-1 rounded-sm font-mono text-[10px] disabled:opacity-50"
        style={{ border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}
      >
        Next
      </button>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [usersQuery, setUsersQuery] = useState("");

  const [recentUploads, setRecentUploads] = useState<AdminUpload[]>([]);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotalPages, setRecentTotalPages] = useState(1);
  const [recentTotalCount, setRecentTotalCount] = useState(0);
  const [recentQuery, setRecentQuery] = useState("");

  const [selectedUserKey, setSelectedUserKey] = useState("");
  const [selectedUserUploads, setSelectedUserUploads] = useState<AdminUpload[]>([]);
  const [selectedUploadsPage, setSelectedUploadsPage] = useState(1);
  const [selectedUploadsTotalPages, setSelectedUploadsTotalPages] = useState(1);
  const [selectedUploadsTotalCount, setSelectedUploadsTotalCount] = useState(0);
  const [selectedUploadsQuery, setSelectedUploadsQuery] = useState("");

  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState("");

  const apiHeaders = useMemo(() => ({ key: user.apiToken }), [user.apiToken]);

  const fetchUsers = useCallback(async (page: number, query: string) => {
    const response = await fetch(
      `/api/admin/users?page=${page}&limit=${USERS_PER_PAGE}&q=${encodeURIComponent(query)}`,
      { headers: apiHeaders, method: "GET" },
    );

    if (response.status === 403 || response.status === 401) {
      setAccessDenied(true);
      throw new Error("Forbidden");
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Failed to load users");
    }

    const data: PaginatedUsersResponse = await response.json();
    setUsers(data.users || []);
    setUsersPage(data.page || page);
    setUsersTotalPages(data.total_pages || 1);
    setUsersTotalCount(data.total || 0);
    setNameDrafts((prev) => {
      const next = { ...prev };
      for (const u of data.users || []) {
        if (next[u.key] === undefined) next[u.key] = u.displayName;
      }
      return next;
    });
  }, [apiHeaders]);

  const fetchRecentUploads = useCallback(async (page: number, query: string) => {
    const response = await fetch(
      `/api/admin/uploads/recent?page=${page}&limit=${RECENT_UPLOADS_PER_PAGE}&q=${encodeURIComponent(query)}`,
      { headers: apiHeaders, method: "GET" },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Failed to load recent uploads");
    }

    const data: PaginatedUploadsResponse = await response.json();
    setRecentUploads(data.uploads || []);
    setRecentPage(data.page || page);
    setRecentTotalPages(data.total_pages || 1);
    setRecentTotalCount(data.total || 0);
  }, [apiHeaders]);

  const fetchUploadsByUser = useCallback(async (userKey: string, page: number, query: string) => {
    const response = await fetch(
      `/api/admin/uploads/user/${encodeURIComponent(userKey)}?page=${page}&limit=${USER_UPLOADS_PER_PAGE}&q=${encodeURIComponent(query)}`,
      { headers: apiHeaders, method: "GET" },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Failed to load user uploads");
    }

    const data: PaginatedUploadsResponse = await response.json();
    setSelectedUserKey(userKey);
    setSelectedUserUploads(data.uploads || []);
    setSelectedUploadsPage(data.page || page);
    setSelectedUploadsTotalPages(data.total_pages || 1);
    setSelectedUploadsTotalCount(data.total || 0);
  }, [apiHeaders]);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      fetchUsers(usersPage, usersQuery),
      fetchRecentUploads(recentPage, recentQuery),
    ]);
    if (selectedUserKey) {
      await fetchUploadsByUser(selectedUserKey, selectedUploadsPage, selectedUploadsQuery);
    }
  }, [fetchRecentUploads, fetchUploadsByUser, fetchUsers, recentPage, recentQuery, selectedUploadsPage, selectedUploadsQuery, selectedUserKey, usersPage, usersQuery]);

  const updateDisplayName = async (targetKey: string) => {
    const displayName = (nameDrafts[targetKey] || "").trim();
    if (!displayName) {
      toast.error("Display name cannot be empty");
      return;
    }

    setActionLoading(`name:${targetKey}`);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetKey)}/display-name`, {
        headers: { ...apiHeaders, "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ display_name: displayName }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update display name");
      }

      toast.success("Display name updated");
      await fetchUsers(usersPage, usersQuery);
      if (selectedUserKey === targetKey) {
        await fetchUploadsByUser(targetKey, selectedUploadsPage, selectedUploadsQuery);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update display name");
    } finally {
      setActionLoading("");
    }
  };

  const rerollKey = async (targetKey: string) => {
    if (!confirm("Reroll this user's key? Their old key will stop working immediately.")) return;

    setActionLoading(`reroll:${targetKey}`);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetKey)}/reroll-key`, {
        headers: apiHeaders,
        method: "PUT",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Failed to reroll key");
      }

      const data = await response.json();
      toast.success("Key rerolled");
      if (data.new_key) {
        navigator.clipboard.writeText(data.new_key);
        toast.success("New key copied");
      }

      if (selectedUserKey === targetKey) {
        setSelectedUserKey(data.new_key || "");
      }
      await refreshDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reroll key");
    } finally {
      setActionLoading("");
    }
  };

  const deleteUpload = async (fileName: string) => {
    if (!confirm(`Delete upload ${fileName}?`)) return;

    setActionLoading(`upload:${fileName}`);
    try {
      const response = await fetch(`/api/admin/uploads/${encodeURIComponent(fileName)}`, {
        headers: apiHeaders,
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Failed to delete upload");
      }

      toast.success("Upload deleted");
      await refreshDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete upload");
    } finally {
      setActionLoading("");
    }
  };

  const deleteUserUploads = async (targetKey: string) => {
    if (!confirm("Delete all uploads for this user?")) return;

    setActionLoading(`uploads:${targetKey}`);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetKey)}/uploads`, {
        headers: apiHeaders,
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Failed to delete user uploads");
      }

      toast.success("User uploads deleted");
      await refreshDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user uploads");
    } finally {
      setActionLoading("");
    }
  };

  const deleteUser = async (targetKey: string) => {
    if (!confirm("Delete this user and all their uploads?")) return;

    setActionLoading(`user:${targetKey}`);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetKey)}`, {
        headers: apiHeaders,
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Failed to delete user");
      }

      toast.success("User deleted");
      if (selectedUserKey === targetKey) {
        setSelectedUserKey("");
        setSelectedUserUploads([]);
        setSelectedUploadsTotalCount(0);
      }
      await refreshDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    if (!user.apiToken) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchUsers(1, ""), fetchRecentUploads(1, "")]);
      } catch (err) {
        if (err instanceof Error && err.message === "Forbidden") return;
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchRecentUploads, fetchUsers, user.apiToken]);

  useEffect(() => {
    if (loading || accessDenied) return;
    setUsersPage(1);
    fetchUsers(1, usersQuery).catch(() => {});
  }, [accessDenied, fetchUsers, loading, usersQuery]);

  useEffect(() => {
    if (loading || accessDenied) return;
    setRecentPage(1);
    fetchRecentUploads(1, recentQuery).catch(() => {});
  }, [accessDenied, fetchRecentUploads, loading, recentQuery]);

  useEffect(() => {
    if (loading || accessDenied || !selectedUserKey) return;
    setSelectedUploadsPage(1);
    fetchUploadsByUser(selectedUserKey, 1, selectedUploadsQuery).catch(() => {});
  }, [accessDenied, fetchUploadsByUser, loading, selectedUploadsQuery, selectedUserKey]);

  if (!user.apiToken) return <Unauthenticated />;

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#06060e" }}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((s) => !s)} />
      <main className="min-h-screen transition-all duration-300" style={{ paddingLeft: sidebarOpen ? "16rem" : "0" }}>
        <div className="p-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "#0a0a12" }}>
              <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid rgba(239,68,68,0.12)", backgroundColor: "#0f0f1a" }}>
                <Terminal className="w-3.5 h-3.5 text-red-400" />
                <span className="font-mono text-xs" style={{ color: "#71717a" }}>admin · moderation</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-red-400" />
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#f87171" }}>server-authorized</span>
                </div>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#f4f4f5" }}>Admin Dashboard</h1>
                <p className="mt-1 text-sm" style={{ color: "#71717a" }}>
                  All admin actions are validated server-side using your API key on every request.
                </p>
              </div>
            </div>
          </motion.div>

          {accessDenied ? (
            <div className="rounded-sm p-8 text-center" style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "#0a0a12" }}>
              <AlertCircle className="w-8 h-8 mb-3 mx-auto text-red-400" />
              <p className="font-semibold" style={{ color: "#f87171" }}>Access denied</p>
              <p className="text-sm mt-1" style={{ color: "#71717a" }}>Your key is not admin-authorized by the backend.</p>
            </div>
          ) : loading ? (
            <div className="rounded-sm p-8" style={{ border: "1px solid rgba(139,92,246,0.12)", backgroundColor: "#0a0a12" }}>
              <p className="font-mono text-xs" style={{ color: "#71717a" }}>Loading admin data...</p>
            </div>
          ) : error ? (
            <div className="rounded-sm p-6" style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "#0a0a12" }}>
              <p className="font-mono text-xs" style={{ color: "#f87171" }}>{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Users", value: usersTotalCount, icon: <Users className="w-4 h-4 text-violet-400" /> },
                  { label: "Recent Uploads", value: recentTotalCount, icon: <Clock3 className="w-4 h-4 text-indigo-400" /> },
                  { label: "Selected User Uploads", value: selectedUploadsTotalCount, icon: <Layers className="w-4 h-4 text-emerald-400" /> },
                ].map((item) => (
                  <div key={item.label} className="rounded-sm p-4" style={{ border: "1px solid rgba(139,92,246,0.16)", backgroundColor: "#0a0a12" }}>
                    <div className="flex items-center gap-2">{item.icon}<span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#71717a" }}>{item.label}</span></div>
                    <p className="text-2xl font-bold mt-2" style={{ color: "#f4f4f5" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.16)", backgroundColor: "#0a0a12" }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)", backgroundColor: "#0f0f1a" }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: "#a1a1aa" }}>User Management</span>
                    <input
                      value={usersQuery}
                      onChange={(e) => setUsersQuery(e.target.value)}
                      placeholder="Search user, key, domain, IP"
                      className="px-3 py-1.5 rounded-sm font-mono text-[10px] outline-none w-56"
                      style={{ backgroundColor: "#06060e", border: "1px solid rgba(139,92,246,0.2)", color: "#f4f4f5" }}
                    />
                  </div>
                  <Pagination page={usersPage} totalPages={usersTotalPages} onPage={(p) => { setUsersPage(p); fetchUsers(p, usersQuery); }} />
                </div>
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {users.map((u) => (
                    <div key={u.key} className="rounded-sm p-3 space-y-3" style={{ border: "1px solid rgba(139,92,246,0.12)", backgroundColor: "#0b0b14" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: "#f4f4f5" }}>{u.displayName}</p>
                          <p className="font-mono text-[10px]" style={{ color: "#71717a" }}>{u.key}</p>
                          <p className="font-mono text-[10px] mt-1" style={{ color: "#a1a1aa" }}>IP created: {u.ip}</p>
                        </div>
                        <span className="font-mono text-[10px] px-2 py-1 rounded-sm" style={{ border: "1px solid rgba(139,92,246,0.2)", color: u.admin ? "#34d399" : "#a1a1aa" }}>
                          {u.admin ? "admin" : "user"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={nameDrafts[u.key] ?? ""}
                          onChange={(e) => setNameDrafts((prev) => ({ ...prev, [u.key]: e.target.value }))}
                          className="flex-1 px-3 py-2 rounded-sm font-mono text-xs outline-none"
                          style={{ backgroundColor: "#06060e", border: "1px solid rgba(139,92,246,0.2)", color: "#f4f4f5" }}
                        />
                        <button
                          onClick={() => updateDisplayName(u.key)}
                          disabled={actionLoading === `name:${u.key}`}
                          className="px-2.5 py-2 rounded-sm text-xs disabled:opacity-50"
                          style={{ border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => fetchUploadsByUser(u.key, 1, selectedUploadsQuery)} className="px-2.5 py-1 rounded-sm font-mono text-[10px]" style={{ border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}>View Uploads</button>
                        <button onClick={() => rerollKey(u.key)} disabled={actionLoading === `reroll:${u.key}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono text-[10px] disabled:opacity-50" style={{ border: "1px solid rgba(234,179,8,0.3)", color: "#fbbf24" }}><RefreshCw className="w-3 h-3" />Reroll Key</button>
                        <button onClick={() => deleteUserUploads(u.key)} disabled={actionLoading === `uploads:${u.key}`} className="px-2.5 py-1 rounded-sm font-mono text-[10px] disabled:opacity-50" style={{ border: "1px solid rgba(239,68,68,0.28)", color: "#f87171" }}>Delete Uploads</button>
                        <button onClick={() => deleteUser(u.key)} disabled={actionLoading === `user:${u.key}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono text-[10px] disabled:opacity-50" style={{ border: "1px solid rgba(239,68,68,0.45)", color: "#ef4444" }}><Trash2 className="w-3 h-3" />Delete User</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.2)", backgroundColor: "#0a0a12" }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(99,102,241,0.12)", backgroundColor: "#0f0f1a" }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: "#a1a1aa" }}>Most Recent Uploads</span>
                    <input
                      value={recentQuery}
                      onChange={(e) => setRecentQuery(e.target.value)}
                      placeholder="Search file, user, key, IP"
                      className="px-3 py-1.5 rounded-sm font-mono text-[10px] outline-none w-56"
                      style={{ backgroundColor: "#06060e", border: "1px solid rgba(139,92,246,0.2)", color: "#f4f4f5" }}
                    />
                  </div>
                  <Pagination page={recentPage} totalPages={recentTotalPages} onPage={(p) => { setRecentPage(p); fetchRecentUploads(p, recentQuery); }} />
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {recentUploads.map((upload) => (
                    <div key={upload.fileName} className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.15)", backgroundColor: "#0b0b14" }}>
                      <img src={`https://s3.tritan.gg/images/${upload.fileName}`} alt={upload.fileName} className="h-36 w-full object-cover" />
                      <div className="p-3 space-y-1.5">
                        <p className="font-mono text-xs truncate" style={{ color: "#f4f4f5" }}>{upload.fileName}</p>
                        <p className="font-mono text-[10px]" style={{ color: "#a1a1aa" }}>{upload.displayName} · {upload.ip}</p>
                        <p className="font-mono text-[10px]" style={{ color: "#71717a" }}>{new Date(upload.metadata.uploadDate).toLocaleString()} · {upload.metadata.views} views</p>
                        <button onClick={() => deleteUpload(upload.fileName)} disabled={actionLoading === `upload:${upload.fileName}`} className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono text-[10px] disabled:opacity-50" style={{ border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}><Trash2 className="w-3 h-3" />Delete Upload</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedUserKey && (
                <div className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.2)", backgroundColor: "#0a0a12" }}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(139,92,246,0.12)", backgroundColor: "#0f0f1a" }}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs" style={{ color: "#a1a1aa" }}>Uploads by user: {selectedUserKey}</span>
                      <input
                        value={selectedUploadsQuery}
                        onChange={(e) => setSelectedUploadsQuery(e.target.value)}
                        placeholder="Search this user's uploads"
                        className="px-3 py-1.5 rounded-sm font-mono text-[10px] outline-none w-56"
                        style={{ backgroundColor: "#06060e", border: "1px solid rgba(139,92,246,0.2)", color: "#f4f4f5" }}
                      />
                    </div>
                    <Pagination page={selectedUploadsPage} totalPages={selectedUploadsTotalPages} onPage={(p) => { setSelectedUploadsPage(p); fetchUploadsByUser(selectedUserKey, p, selectedUploadsQuery); }} />
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {selectedUserUploads.map((upload) => (
                      <div key={upload.fileName} className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.14)", backgroundColor: "#0b0b14" }}>
                        <img src={`https://s3.tritan.gg/images/${upload.fileName}`} alt={upload.fileName} className="h-36 w-full object-cover" />
                        <div className="p-3 space-y-1.5">
                          <p className="font-mono text-xs truncate" style={{ color: "#f4f4f5" }}>{upload.fileName}</p>
                          <p className="font-mono text-[10px]" style={{ color: "#71717a" }}>{new Date(upload.metadata.uploadDate).toLocaleString()} · {upload.metadata.views} views</p>
                          <button onClick={() => deleteUpload(upload.fileName)} disabled={actionLoading === `upload:${upload.fileName}`} className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono text-[10px] disabled:opacity-50" style={{ border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}><Trash2 className="w-3 h-3" />Delete Upload</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
