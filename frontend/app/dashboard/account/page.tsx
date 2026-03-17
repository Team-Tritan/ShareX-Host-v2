/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import {
  Copy,
  RefreshCw,
  Trash2,
  User,
  Shield,
  Globe,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Terminal,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AccountSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
  icon?: React.ReactNode;
}
const AccountSection: React.FC<AccountSectionProps> = ({
  title,
  description,
  children,
  className = "",
  danger = false,
  icon,
}) => (
  <div
    className={`rounded-sm overflow-hidden ${className}`}
    style={{
      border: danger
        ? "1px solid rgba(239,68,68,0.2)"
        : "1px solid rgba(139,92,246,0.18)",
      backgroundColor: "#0a0a12",
    }}
  >
    <div
      className="flex items-center gap-2.5 px-5 py-3"
      style={{
        borderBottom: danger
          ? "1px solid rgba(239,68,68,0.12)"
          : "1px solid rgba(139,92,246,0.12)",
        backgroundColor: "#0f0f1a",
      }}
    >
      {icon && <span>{icon}</span>}
      <div>
        <p
          className="text-sm font-semibold tracking-tight"
          style={{ color: danger ? "#f87171" : "#f4f4f5" }}
        >
          {title}
        </p>
        <p className="font-mono text-[10px]" style={{ color: "#52525b" }}>
          {description}
        </p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 font-mono text-sm rounded-sm outline-none transition-all ${props.className ?? ""}`}
    style={{
      backgroundColor: "#06060e",
      border: "1px solid rgba(139,92,246,0.2)",
      color: "#f4f4f5",
      ...props.style,
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)";
      props.onBlur?.(e);
    }}
  />
);

const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props,
) => (
  <select
    {...props}
    className={`w-full px-4 py-2.5 font-mono text-sm rounded-sm outline-none ${props.className ?? ""}`}
    style={{
      backgroundColor: "#06060e",
      border: "1px solid rgba(139,92,246,0.2)",
      color: "#f4f4f5",
    }}
  />
);

const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => (
  <button
    {...props}
    className="flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-semibold transition-colors disabled:opacity-50"
    style={{
      border: "1px solid rgba(139,92,246,0.35)",
      backgroundColor: "rgba(139,92,246,0.2)",
      color: "#fff",
    }}
    onMouseEnter={(e) => {
      if (!props.disabled)
        e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.28)";
    }}
    onMouseLeave={(e) => {
      if (!props.disabled)
        e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.2)";
    }}
  >
    {children}
  </button>
);

const GhostBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => (
  <button
    {...props}
    className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm transition-colors disabled:opacity-50"
    style={{
      border: "1px solid rgba(139,92,246,0.15)",
      backgroundColor: "transparent",
      color: "#a1a1aa",
    }}
    onMouseEnter={(e) => {
      if (!props.disabled)
        e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.06)";
    }}
    onMouseLeave={(e) => {
      if (!props.disabled)
        e.currentTarget.style.backgroundColor = "transparent";
    }}
  >
    {children}
  </button>
);

const ModalBackdrop: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 flex items-center justify-center p-4 z-50"
    style={{ backgroundColor: "rgba(6,6,14,0.8)", backdropFilter: "blur(4px)" }}
  >
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-md rounded-sm overflow-hidden"
      style={{
        border: "1px solid rgba(139,92,246,0.25)",
        backgroundColor: "#0a0a12",
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);

const DeleteModal: React.FC<{
  onCancel: () => void;
  onDelete: () => void;
  isSaving: boolean;
}> = ({ onCancel, onDelete, isSaving }) => (
  <ModalBackdrop>
    <div
      className="px-5 py-3 flex items-center gap-2"
      style={{
        borderBottom: "1px solid rgba(239,68,68,0.15)",
        backgroundColor: "#0f0f1a",
      }}
    >
      <AlertTriangle className="w-4 h-4 text-red-400" />
      <span className="text-sm font-semibold" style={{ color: "#f87171" }}>
        Delete Account
      </span>
    </div>
    <div className="p-5 space-y-5">
      <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
        This action is permanent. All files, URLs, and account data will be
        erased.
      </p>
      <div className="flex gap-3">
        <GhostBtn onClick={onCancel} className="flex-1 justify-center">
          Cancel
        </GhostBtn>
        <button
          onClick={onDelete}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold transition-colors disabled:opacity-50"
          style={{
            border: "1px solid rgba(239,68,68,0.35)",
            backgroundColor: "rgba(239,68,68,0.12)",
            color: "#f87171",
          }}
        >
          <Trash2 className="w-4 h-4" />
          {isSaving ? "Deleting..." : "Confirm Delete"}
        </button>
      </div>
    </div>
  </ModalBackdrop>
);

const AddDomainModal: React.FC<{
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  newDomain: string;
  setNewDomain: (v: string) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
}> = ({
  onCancel,
  onSave,
  isSaving,
  newDomain,
  setNewDomain,
  isPublic,
  setIsPublic,
}) => (
  <ModalBackdrop>
    <div
      className="px-5 py-3 flex items-center gap-2"
      style={{
        borderBottom: "1px solid rgba(139,92,246,0.15)",
        backgroundColor: "#0f0f1a",
      }}
    >
      <Plus className="w-4 h-4 text-violet-400" />
      <span className="text-sm font-semibold" style={{ color: "#f4f4f5" }}>
        Add Custom Domain
      </span>
    </div>
    <div className="p-5 space-y-4">
      <div
        className="rounded-sm p-3 space-y-1 font-mono text-xs"
        style={{
          border: "1px solid rgba(99,102,241,0.2)",
          backgroundColor: "rgba(99,102,241,0.06)",
          color: "#818cf8",
        }}
      >
        <p className="font-semibold">DNS Setup</p>
        <p>
          A record → <span style={{ color: "#f4f4f5" }}>23.142.248.42</span>
        </p>
        <p>Cloudflare: enable proxy + flexible SSL</p>
      </div>
      <StyledInput
        type="text"
        value={newDomain}
        onChange={(e) => setNewDomain(e.target.value)}
        placeholder="example.com"
      />
      <StyledSelect
        value={isPublic ? "public" : "private"}
        onChange={(e) => setIsPublic(e.target.value === "public")}
      >
        <option value="private">Private (only you)</option>
        <option value="public">Public (anyone)</option>
      </StyledSelect>
      <div className="flex gap-3">
        <GhostBtn onClick={onCancel} className="flex-1 justify-center">
          Cancel
        </GhostBtn>
        <PrimaryBtn
          onClick={onSave}
          disabled={isSaving || !newDomain}
          className="flex-1 justify-center"
        >
          {isSaving ? "Adding..." : "Add Domain"}
        </PrimaryBtn>
      </div>
    </div>
  </ModalBackdrop>
);

const AccountSettings: React.FC = () => {
  const user = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    displayName: false,
    apiToken: false,
    domain: false,
    deleteAccount: false,
  });

  useEffect(() => {
    fetchEligibleDomains();
  }, []);
  if (!user.apiToken) return <Unauthenticated />;

  const handleApiRequest = async (
    url: string,
    method: string,
    body?: unknown,
  ) => {
    try {
      return await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", key: user.apiToken },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      return null;
    }
  };

  const fetchEligibleDomains = async () => {
    const r = await handleApiRequest("/api/domains", "GET");
    if (r?.ok) {
      const d = await r.json();
      user.setAvailableDomains(d.domains);
    }
  };

  const handleDisplayNameChange = async () => {
    setLoadingStates((p) => ({ ...p, displayName: true }));
    const r = await handleApiRequest("/api/account/name", "PUT", {
      display_name: user.displayName,
    });
    r?.ok
      ? toast.success("Display name updated")
      : toast.error("Failed to update name");
    setLoadingStates((p) => ({ ...p, displayName: false }));
  };

  const handleRegenerateToken = async () => {
    setLoadingStates((p) => ({ ...p, apiToken: true }));
    const r = await handleApiRequest("/api/account/token", "PUT");
    if (r?.ok) {
      const d = await r.json();
      user.setToken(d.key);
      toast.success("Token regenerated.");
    } else toast.error("Failed to regenerate token");
    setLoadingStates((p) => ({ ...p, apiToken: false }));
  };

  const handleDeleteAccount = async () => {
    setLoadingStates((p) => ({ ...p, deleteAccount: true }));
    const r = await handleApiRequest("/api/account/delete", "PUT");
    if (r?.ok) {
      toast.success("Account deleted.");
      setIsDeleteModalOpen(false);
      router.push("/");
    } else toast.error("Failed to delete account");
    setLoadingStates((p) => ({ ...p, deleteAccount: false }));
  };

  const handleDomainChange = async () => {
    setLoadingStates((p) => ({ ...p, domain: true }));
    const r = await handleApiRequest(
      `/api/account/domain?value=${user.domain}`,
      "PUT",
    );
    r?.ok
      ? toast.success("Domain changed.")
      : toast.error("Failed to change domain.");
    setLoadingStates((p) => ({ ...p, domain: false }));
  };

  const handleAddDomain = async () => {
    setLoadingStates((p) => ({ ...p, domain: true }));
    const r = await handleApiRequest(
      `/api/domains?i=${newDomain}&p=${isPublic}`,
      "PUT",
    );
    if (r?.ok) {
      toast.success("Domain added.");
      fetchEligibleDomains();
      setIsAddDomainModalOpen(false);
    } else toast.error("Failed to add domain.");
    setLoadingStates((p) => ({ ...p, domain: false }));
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
                  account · settings
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
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
              <div className="p-6 space-y-1">
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "#f4f4f5" }}
                >
                  Account Settings
                </h1>
                <p className="text-sm" style={{ color: "#71717a" }}>
                  Manage your display name, domains, and API token.
                </p>
              </div>
              <div
                className="px-5 py-3 flex flex-wrap gap-6"
                style={{
                  borderTop: "1px solid rgba(139,92,246,0.1)",
                  backgroundColor: "#0f0f1a",
                }}
              >
                {[
                  {
                    label: "Display Name",
                    value: user.displayName,
                    icon: <User className="w-3 h-3 text-violet-400" />,
                  },
                  {
                    label: "Domain",
                    value: user.domain,
                    icon: <Globe className="w-3 h-3 text-pink-400" />,
                  },
                  {
                    label: "Domains",
                    value: `${user.availableDomains.length} available`,
                    icon: <Settings className="w-3 h-3 text-indigo-400" />,
                  },
                  {
                    label: "Security",
                    value: "Protected",
                    icon: <Shield className="w-3 h-3 text-emerald-400" />,
                  },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    {icon}
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="lg:col-span-8 space-y-3 lg:space-y-4">
              <AccountSection
                title="Display Name"
                description="Shown on your uploads and profile."
                icon={<User className="w-4 h-4 text-violet-400" />}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <StyledInput
                    type="text"
                    value={user.displayName}
                    onChange={(e) => user.setDisplayName(e.target.value)}
                    placeholder="Your display name"
                  />
                  <PrimaryBtn
                    onClick={handleDisplayNameChange}
                    disabled={loadingStates.displayName}
                  >
                    {loadingStates.displayName ? "Saving..." : "Save"}
                  </PrimaryBtn>
                </div>
              </AccountSection>

              <AccountSection
                title="Domain Configuration"
                description="Choose which domain hosts your uploads."
                icon={<Globe className="w-4 h-4 text-pink-400" />}
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <StyledSelect
                      value={user.domain}
                      onChange={(e) => user.setDomain(e.target.value)}
                    >
                      {user.availableDomains.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </StyledSelect>
                    <PrimaryBtn
                      onClick={handleDomainChange}
                      disabled={loadingStates.domain}
                    >
                      {loadingStates.domain ? "Saving..." : "Save"}
                    </PrimaryBtn>
                  </div>
                  <GhostBtn
                    onClick={() => setIsAddDomainModalOpen(true)}
                    disabled={loadingStates.domain}
                  >
                    <Plus className="w-4 h-4" /> Add Custom Domain
                  </GhostBtn>
                </div>
              </AccountSection>
            </div>

            <div className="lg:col-span-4 space-y-3 lg:space-y-4 lg:sticky lg:top-6 self-start">
              <AccountSection
                title="API Token"
                description="Keep this secret - it grants full access to your account."
                icon={<Shield className="w-4 h-4 text-indigo-400" />}
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <StyledInput
                        type={showToken ? "text" : "password"}
                        readOnly
                        value={user.apiToken}
                        style={{ paddingRight: "3rem" }}
                      />
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "#52525b" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#a1a1aa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#52525b")
                        }
                      >
                        {showToken ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <GhostBtn
                      onClick={() => {
                        navigator.clipboard.writeText(user.apiToken);
                        toast.success("Token copied.");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </GhostBtn>
                  </div>
                  <GhostBtn
                    onClick={handleRegenerateToken}
                    disabled={loadingStates.apiToken}
                  >
                    <RefreshCw className="w-4 h-4" />
                    {loadingStates.apiToken
                      ? "Regenerating..."
                      : "Regenerate Token"}
                  </GhostBtn>
                </div>
              </AccountSection>

              <AccountSection
                title="Danger Zone"
                description="Irreversible actions. Proceed with caution."
                danger
                icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
              >
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm transition-colors"
                  style={{
                    border: "1px solid rgba(239,68,68,0.3)",
                    backgroundColor: "rgba(239,68,68,0.08)",
                    color: "#f87171",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(239,68,68,0.14)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(239,68,68,0.08)")
                  }
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </AccountSection>
            </div>
          </motion.div>
        </div>
      </main>

      {isDeleteModalOpen && (
        <DeleteModal
          onCancel={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteAccount}
          isSaving={loadingStates.deleteAccount}
        />
      )}
      {isAddDomainModalOpen && (
        <AddDomainModal
          onCancel={() => setIsAddDomainModalOpen(false)}
          onSave={handleAddDomain}
          isSaving={loadingStates.domain}
          newDomain={newDomain}
          setNewDomain={setNewDomain}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
        />
      )}
    </div>
  );
};

export default AccountSettings;
