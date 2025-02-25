"use client";

import React from "react";
import { motion } from "framer-motion";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import Unauthenticated from "@/components/unauth";
import { useTokenStore } from "@/stores/session.store";
import { Sidebar } from "@/components/sidebar";
import { useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';

const AccountSettings: React.FC = () => {
  const { apiToken, displayName, setToken, setDisplayName } = useTokenStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDisplayNameSaving, setIsDisplayNameSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isApiTokenSaving, setIsApiTokenSaving] = React.useState(false);
  const router = useRouter();

  if (!apiToken) return <Unauthenticated />;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleApiRequest = async (url: string, method: string, body?: any) => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          key: apiToken,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      return response;
    } catch {
      return null;
    }
  };

  const handleDisplayNameChange = async () => {
    const response = await handleApiRequest("/api/account", "PUT", {
      display_name: displayName,
    });
    setIsDisplayNameSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    response?.ok
      ? toast.success("Display name updated successfully")
      : toast.error("Failed to update display name");

    setIsDisplayNameSaving(false);
  };

  const handleRegenerateToken = async () => {
    setIsApiTokenSaving(true);
    const response = await handleApiRequest("/api/account/regen", "PUT");
    if (response?.ok) {
      const data = await response.json();
      setToken(data.key);
      toast.success("Token regenerated successfully.");
      setIsApiTokenSaving(false);
    } else {
      toast.error("Failed to regenerate token");
    };
  };

  const handleDeleteAccount = async () => {
    const response = await handleApiRequest("/api/account", "DELETE");
    setIsDeleting(true);
    if (response?.ok) {
      toast.success("Account deleted successfully.");
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
      router.push("/");
    } else {
      toast.error("Failed to delete account");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiToken);
    toast.success("API token copied to clipboard");
  };

  return (
    <div className="flex h-screen bg-[#0d0c0e] text-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <main
        className={`flex-1 overflow-auto p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"
          }`}
      >
        <motion.h1
          className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Account Settings
        </motion.h1>
        <motion.div
          className="text-gray-400 mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Manage your account settings below.
        </motion.div>

        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AccountSection
            title="Display Name"
            description="This is the display name that shows on your uploads."
          >
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 bg-[#171619] border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              placeholder="Enter your display name"
            />
            <button
              onClick={handleDisplayNameChange}
              disabled={isDisplayNameSaving}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isDisplayNameSaving ? "Saving..." : "Save Changes"}
            </button>
          </AccountSection>

          <AccountSection
            title="API Token"
            description="Your API token for uploading images. Keep this secure!"
          >
            <div className="flex gap-2">
              <input
                type="password"
                readOnly
                value={apiToken}
                className="w-full px-4 py-2 bg-[#171619] border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 bg-[#171619] rounded-lg border border-zinc-700"
              >
                <Copy className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <button
              onClick={handleRegenerateToken}
              disabled={isApiTokenSaving}
              className="inline-flex items-center px-4 py-2 bg-[#171619] rounded-lg border border-zinc-800 text-white"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              {isApiTokenSaving ? "Regenerating..." : "Regenerate Token"}
            </button>
          </AccountSection>

          <AccountSection
            title="Delete Account"
            description="Once you delete your account, there is no going back. Please be certain."
            className="border-red-500/50"
            titleClassName="text-red-500"
          >
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-red-500"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Account
            </button>
          </AccountSection>
        </motion.div>

        {isDeleteModalOpen && (
          <DeleteModal
            onCancel={() => setIsDeleteModalOpen(false)}
            onDelete={handleDeleteAccount}
            isSaving={isDeleting}
          />
        )}
      </main>
    </div>
  );
};

interface AccountSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

const AccountSection: React.FC<AccountSectionProps> = ({
  title,
  description,
  children,
  className = "",
  titleClassName = "",
}) => (
  <motion.div
    className={`rounded-xl p-6 border border-zinc-800 ${className}`}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h2 className={`text-xl font-semibold text-white ${titleClassName}`}>
      {title}
    </h2>
    <p className="mt-2 text-gray-400">{description}</p>
    <div className="mt-4 space-y-4">{children}</div>
  </motion.div>
);

interface DeleteModalProps {
  onCancel: () => void;
  onDelete: () => void;
  isSaving: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  onCancel,
  onDelete,
  isSaving,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="bg-[#171619] rounded-xl p-6 max-w-md w-full border border-gray-800"
    >
      <h3 className="text-xl font-semibold text-white">Delete Account</h3>
      <p className="mt-2 text-gray-400">
        Are you sure you want to delete your account? This action cannot be
        undone.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
        >
          Cancel
        </button>
        <button
          onClick={onDelete}
          disabled={isSaving}
          className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-red-500"
        >
          {isSaving ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default AccountSettings;
