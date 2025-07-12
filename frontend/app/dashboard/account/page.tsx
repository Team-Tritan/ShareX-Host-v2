/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/stores/user";
import Unauthenticated from "@/components/Unauth";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Copy, RefreshCw, Trash2, User, Shield, Globe, AlertTriangle, Eye, EyeOff, Plus, Settings } from "lucide-react";
import { toast } from "react-hot-toast";

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
    body?: unknown
  ) => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          key: user.apiToken,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      return response;
    } catch {
      return null;
    }
  };

  const fetchEligibleDomains = async () => {
    const response = await handleApiRequest("/api/domains", "GET");
    if (response?.ok) {
      const data = await response.json();
      user.setAvailableDomains(data.domains);
    }
  }

  const handleDisplayNameChange = async () => {
    setLoadingStates((prev) => ({ ...prev, displayName: true }));

    const response = await handleApiRequest("/api/account/name", "PUT", {
      display_name: user.displayName,
    });

    response?.ok
      ? toast.success("Display name updated successfully")
      : toast.error("Failed to update display name");

    setLoadingStates((prev) => ({ ...prev, displayName: false }));
  };

  const handleRegenerateToken = async () => {
    setLoadingStates((prev) => ({ ...prev, apiToken: true }));

    const response = await handleApiRequest("/api/account/token", "PUT");

    if (response?.ok) {
      const data = await response.json();
      user.setToken(data.key);
      toast.success("Token regenerated successfully.");
    } else {
      toast.error("Failed to regenerate token");
    }
    setLoadingStates((prev) => ({ ...prev, apiToken: false }));
  };

  const handleDeleteAccount = async () => {
    setLoadingStates((prev) => ({ ...prev, deleteAccount: true }));

    const response = await handleApiRequest("/api/account/delete", "PUT");

    if (response?.ok) {
      toast.success("Account deleted successfully.");
      setIsDeleteModalOpen(false);
      router.push("/");
    } else {
      toast.error("Failed to delete account");
    }
    setLoadingStates((prev) => ({ ...prev, deleteAccount: false }));
  };

  const handleDomainChange = async () => {
    setLoadingStates((prev) => ({ ...prev, domain: true }));

    const response = await handleApiRequest(
      `/api/account/domain?value=${user.domain}`,
      "PUT"
    );

    if (response?.ok) {
      toast.success(
        "Domain changed successfully."
      );
    } else {
      toast.error("Failed to change domain.");
    }
    setLoadingStates((prev) => ({ ...prev, domain: false }));
  };

  const handleAddDomain = async () => {
    setLoadingStates((prev) => ({ ...prev, domain: true }));

    const response = await handleApiRequest(
      `/api/domains?i=${newDomain}&p=${isPublic}`,
      "PUT"
    );

    if (response?.ok) {
      toast.success("Domain added successfully.");
      fetchEligibleDomains();
      setIsAddDomainModalOpen(false);
    } else {
      toast.error("Failed to add domain.");
    }
    setLoadingStates((prev) => ({ ...prev, domain: false }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.apiToken);
    toast.success("API token copied to clipboard.");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0d0c0e] via-[#1a1a1d] to-[#0d0c0e] text-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
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
          <motion.h1
            className="mb-2 text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Account Settings
          </motion.h1>
          <motion.div
            className="text-gray-400 text-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Manage your account settings, domains, and API tokens securely.
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
                  Display Name
                </h3>
                <p className="text-xl font-bold text-white truncate">
                  {user.displayName}
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <User className="w-8 h-8 text-purple-400" />
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
                <Globe className="w-8 h-8 text-pink-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-sm border border-indigo-500/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Available Domains
                </h3>
                <p className="text-3xl font-bold text-white">
                  {user.availableDomains.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-500/20 rounded-full">
                <Settings className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AccountSection
            title="Display Name"
            description="This is the display name that shows on your uploads."
            icon={<User className="w-5 h-5 text-purple-400" />}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={user.displayName}
                onChange={(e) => user.setDisplayName(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-200"
                placeholder="Enter your display name"
              />
              <motion.button
                onClick={handleDisplayNameChange}
                disabled={loadingStates.displayName}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl text-white font-medium hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loadingStates.displayName ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </AccountSection>

          <AccountSection
            title="Domain Configuration"
            description="Manage your upload domains and add custom domains."
            icon={<Globe className="w-5 h-5 text-pink-400" />}
          >
            <div className="space-y-4">
              <div className="flex gap-3">
                <select
                  value={user.domain}
                  onChange={(e) => user.setDomain(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-200"
                >
                  {user.availableDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                <motion.button
                  onClick={handleDomainChange}
                  disabled={loadingStates.domain}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl text-white font-medium hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loadingStates.domain ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
              <motion.button
                onClick={() => setIsAddDomainModalOpen(true)}
                disabled={loadingStates.domain}
                className="inline-flex items-center px-4 py-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl text-white font-medium hover:bg-zinc-800/50 transition-all duration-200 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Domain
              </motion.button>
            </div>
          </AccountSection>

          <AccountSection
            title="API Token"
            description="Your API token for uploading images. Keep this secure!"
            icon={<Shield className="w-5 h-5 text-indigo-400" />}
          >
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type={showToken ? "text" : "password"}
                    readOnly
                    value={user.apiToken}
                    className="w-full px-4 py-3 pr-12 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-200"
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <motion.button
                  onClick={copyToClipboard}
                  className="p-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl hover:bg-zinc-800/50 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
              <motion.button
                onClick={handleRegenerateToken}
                disabled={loadingStates.apiToken}
                className="inline-flex items-center px-4 py-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl text-white hover:bg-zinc-800/50 transition-all duration-200 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {loadingStates.apiToken ? "Regenerating..." : "Regenerate Token"}
              </motion.button>
            </div>
          </AccountSection>

          <AccountSection
            title="Danger Zone"
            description="Once you delete your account, there is no going back. Please be certain."
            className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-600/5"
            titleClassName="text-red-400"
            icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          >
            <motion.button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </motion.button>
          </AccountSection>
        </motion.div>

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
  icon?: React.ReactNode;
}

const AccountSection: React.FC<AccountSectionProps> = ({
  title,
  description,
  children,
  className = "",
  titleClassName = "",
  icon,
}) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl bg-[#171619]/60 backdrop-blur-sm border border-zinc-800/50 p-6 transition-all duration-300 hover:border-purple-500/30 ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -2 }}
  >
    <div className="flex items-start space-x-3 mb-4">
      {icon && (
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h2 className={`text-xl font-semibold text-white ${titleClassName}`}>
          {title}
        </h2>
        <p className="mt-1 text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
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
    className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-[#171619]/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-red-500/20 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Delete Account</h3>
      </div>
      <p className="text-gray-400 mb-6">
        Are you sure you want to delete your account? This action cannot be
        undone and will permanently remove all your data.
      </p>
      <div className="flex gap-3">
        <motion.button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-zinc-800/80 backdrop-blur-sm border border-zinc-600/50 rounded-xl text-white hover:bg-zinc-700/80 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
        <motion.button
          onClick={onDelete}
          disabled={isSaving}
          className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-400 transition-all duration-200 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSaving ? "Deleting..." : "Delete Account"}
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

interface AddDomainModalProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  newDomain: string;
  setNewDomain: (value: string) => void;
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
}

const AddDomainModal: React.FC<AddDomainModalProps> = ({
  onCancel,
  onSave,
  isSaving,
  newDomain,
  setNewDomain,
  isPublic,
  setIsPublic,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-[#171619]/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full border border-zinc-800/50 shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-full">
          <Plus className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Add Custom Domain</h3>
      </div>
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-blue-300 text-sm">
            <strong>Setup Instructions:</strong>
          </p>
          <p className="text-blue-200 text-sm mt-1">
            Point your domain to: <code className="bg-blue-500/20 px-1 rounded">23.142.248.43</code>
          </p>
          <p className="text-blue-200 text-sm mt-1">
            For Cloudflare users: Enable proxying (orange cloud) with flexible SSL.
          </p>
        </div>
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="w-full px-4 py-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-200"
          placeholder="example.com"
        />
        <select
          value={isPublic ? "public" : "private"}
          onChange={(e) => setIsPublic(e.target.value === "public")}
          className="w-full px-4 py-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-200"
        >
          <option value="private">Private Domain (Only you can use)</option>
          <option value="public">Public Domain (Anyone can use)</option>
        </select>
      </div>
      <div className="flex gap-3">
        <motion.button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-zinc-800/80 backdrop-blur-sm border border-zinc-600/50 rounded-xl text-white hover:bg-zinc-700/80 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
        <motion.button
          onClick={onSave}
          disabled={isSaving || !newDomain}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl text-white font-medium hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSaving ? "Adding..." : "Add Domain"}
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

export default AccountSettings;