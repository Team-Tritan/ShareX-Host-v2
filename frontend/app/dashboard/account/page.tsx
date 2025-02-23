"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTokenStore } from '@/stores/session.store';
import { Sidebar } from '@/components/sidebar';
import { useRouter } from 'next/navigation';

export default function AccountSettings() {
    const router = useRouter();
    const { apiToken, displayName, setToken, setDisplayName } = useTokenStore();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleDisplayNameChange = async () => {
        try {
            setIsSaving(true);
            const response = await fetch('/api/account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    key: apiToken
                },
                body: JSON.stringify({ display_name: displayName })
            });
            if (response.ok) {
                toast.info('Display name updated successfully');
            } else {
                toast.error('Failed to update display name');
            }
        } catch {
            toast.error('Failed to update display name');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerateToken = async () => {
        try {
            setIsSaving(true);
            const response = await fetch('/api/account/regen', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    key: apiToken
                }
            });
            if (response.ok) {
                const data = await response.json();
                setToken(data.key);
                toast.info('Token regenerated successfully.');
                alert(`Your new api key is: ${data.key}, please save this key as it will not be shown again.`);
            } else {
                toast.error('Failed to regenerate token');
            }
        } catch {
            toast.error('Failed to regenerate token');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsSaving(true);
            const response = await fetch('/api/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    key: apiToken
                }
            });
            if (response.ok) {
                toast.info('Account deleted successfully.');
                setIsDeleteModalOpen(false);
            } else {
                toast.error('Failed to delete account');
            }
        } catch {
            toast.error('Failed to delete account');
        } finally {
            setIsSaving(false);
            router.push('/');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiToken);
        toast.info('API token copied to clipboard');
    };

    return (
        <div className="flex h-screen bg-[#0d0c0e] text-gray-100">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main
                className={`flex-1 overflow-auto p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'
                    }`}
            >
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
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
                    <motion.div
                        className="rounded-xl p-6 border border-zinc-800"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-xl font-semibold text-white">Display Name</h2>
                        <p className="mt-2 text-gray-400">This is the display name that shows on your uploads, this does not change retroactively for previous uploads.</p>
                        <div className="mt-4 space-y-4">
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-2 bg-[#171619] border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                placeholder="Enter your display name"
                            />
                            <button
                                onClick={handleDisplayNameChange}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="backdrop-blur-sm rounded-xl p-6 border border-zinc-800"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-xl font-semibold text-white">API Token</h2>
                        <p className="mt-2 text-gray-400">Your API token for uploading images. Keep this secure!</p>
                        <div className="mt-4 space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    readOnly
                                    value={apiToken}
                                    className="flex-1 px-4 py-2 bg-[#171619] border border-zinc-800 rounded-lg text-white"
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
                                disabled={isSaving}
                                className="inline-flex items-center px-4 py-2 bg-[#171619] rounded-lg border border-zinc-800 text-white"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                {isSaving ? 'Regenerating...' : 'Regenerate Token'}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="backdrop-blur-sm rounded-xl p-6 border border-red-500/50"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-xl font-semibold text-red-500">Delete Account</h2>
                        <p className="mt-2 text-gray-400">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <div className="mt-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-red-500"
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Delete Account
                            </button>
                        </div>
                    </motion.div>
                </motion.div>

                {isDeleteModalOpen && (
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
                                Are you sure you want to delete your account? This action cannot be undone.
                            </p>
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-red-500"
                                >
                                    {isSaving ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
