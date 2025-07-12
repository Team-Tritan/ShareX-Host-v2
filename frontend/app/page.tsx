/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Prompter from "@/components/Prompt";
import { useUser } from "@/stores/user";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Sparkles, Upload, Link2, Shield } from "lucide-react";
import { toast } from "react-hot-toast";

interface AccountResponses {
  displayName: string;
  key: string;
  domain: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const apiToken = useUser((state) => state.apiToken);
  const setToken = useUser((state) => state.setToken);
  const setDomain = useUser((state) => state.setDomain);
  const setDisplayName = useUser((state) => state.setDisplayName);
  const [apiKey, setApiKey] = useState<string>(apiToken);
  const [isPrompterOpen, setIsPrompterOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setApiKey(apiToken);
  }, [apiToken]);

  const handleLogin = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/account", {
        headers: {
          key: apiKey,
        },
        method: "GET",
      });

      if (!response.ok) {
        toast.error("You've entered an invalid API key.");
        return setApiKey("");
      }

      const data: AccountResponses = await response.json();
      setToken(apiKey);
      setDisplayName(data.displayName);
      setDomain(data.domain);
      router.push("/dashboard");
    } catch (error: any) {
      console.log(error)
      toast.error(error.message);
      setApiKey("");
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, router, setDisplayName, setDomain, setToken]);

  const handleCreateKey = useCallback(async () => {
    setIsPrompterOpen(true);
  }, []);

  const handlePrompterConfirm = useCallback(
    async (displayName: string) => {
      setIsPrompterOpen(false);

      if (!displayName)
        return toast.error("Display name is required.");

      try {
        const response = await fetch("/api/account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ display_name: displayName }),
        });

        if (!response.ok)
          return toast.error("Failed to create API key.");

        const data: AccountResponses = await response.json();
        setToken(data.key!);
        setDisplayName(displayName);
        navigator.clipboard.writeText(data.key!);
        toast.success(
          `Your API key has been copied to your clipboard, please keep it safe.`
        );
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [setDisplayName, setToken]
  );

  const handlePrompterCancel = () => {
    setIsPrompterOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0c0e] via-[#1a1a1d] to-[#0d0c0e] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative max-w-md w-full space-y-8 p-8 bg-[#121114]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800/50"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#121114] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Tritan Uploader
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            A free ShareX host where you can put screenshots, images, gifs, and more.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center space-x-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-gray-400">Upload</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-xs text-gray-400">Share</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs text-gray-400">Secure</span>
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium text-gray-300">
              API Key
            </label>
            <div className="relative group">
              <input
                id="api-key"
                name="api-key"
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                className="w-full px-4 py-3 bg-[#1a1a1d] border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 pr-20"
                placeholder="Enter your API key"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogin}
                disabled={isLoading || !apiKey.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                aria-label="Login"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ArrowRight className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !apiKey.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </motion.div>

        <motion.div
          className="flex items-center justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
          <span className="px-4 text-sm text-gray-500 bg-[#121114] font-medium">Or</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button 
            onClick={handleCreateKey} 
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200 underline decoration-dotted underline-offset-4"
          >
            Don{"'"}t have an account? Create an API Key
          </button>
        </motion.div>

        <motion.div
          className="text-center pt-4 border-t border-zinc-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-xs text-gray-500">
            Powered by Tritan Internet
          </p>
        </motion.div>
      </motion.div>

      {isPrompterOpen && (
        <Prompter
          title="Enter Display Name"
          message="Please enter a display name for your account."
          onConfirm={handlePrompterConfirm}
          onCancel={handlePrompterCancel}
        />
      )}
    </div>
  );
};

export default LoginPage;