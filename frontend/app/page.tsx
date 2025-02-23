"use client";

import { useTokenStore } from "@/stores/session.store";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const apiToken = useTokenStore((state) => state.apiToken);
  const setToken = useTokenStore((state) => state.setToken);
  const setDisplayName = useTokenStore((state) => state.setDisplayName);
  const [apiKey, setApiKey] = useState(apiToken);

  useEffect(() => {
    setApiKey(apiToken);
  }, [apiToken]);

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/account", {
        headers: {
          key: apiKey,
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Auth failure");
      }

      const data = await response.json();
      setToken(apiKey);
      setDisplayName(data.displayName);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error verifying account:", error);
      toast.error("Auth failure");
    }
  };

  const handleCreateKey = async () => {
    const displayName = prompt("Please enter a display name:");
    if (!displayName) return alert("Display name is required.");

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display_name: displayName }),
      });

      if (!response.ok) throw new Error("Failed to create API key");

      const data = await response.json();
      setToken(data.key);
      alert(`Your API key is ${data.key}. Please save it somewhere safe.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0c0e]">
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
      <motion.div
        className="max-w-md w-full space-y-8 p-8 bg-[#121114] rounded-xl shadow-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white">Tritan Uploader</h1>
        </motion.div>

        <motion.div
          className="mt-8 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="relative">
            <input
              id="api-key"
              name="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-purple-500 rounded-md bg-[#1a1a1d] text-white focus:outline-none focus:border-purple-600"
              placeholder="API Key"
            />
            <button
              onClick={handleLogin}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500"
              aria-label="Login"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="border-t border-zinc-800 flex-grow"></div>
          <span className="px-4 text-sm text-gray-500">Or</span>
          <div className="border-t border-zinc-800 flex-grow"></div>
        </motion.div>

        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button onClick={handleCreateKey} className="text-sm text-purple-500">
            Create an API Key
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
