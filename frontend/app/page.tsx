/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Prompter from "@/components/Prompt";
import { useUser } from "@/stores/user";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

interface AccountResponses {
  key: string;
  user: {
    DisplayName: string;
    key?: string;
    Domain: string;
  },
  domains: [string];

}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const apiToken = useUser((state) => state.apiToken);
  const setToken = useUser((state) => state.setToken);
  const setDomain = useUser((state) => state.setDomain);
  const setDisplayName = useUser((state) => state.setDisplayName);
  const setAvailableDomains = useUser((state) => state.setAvailableDomains);
  const [apiKey, setApiKey] = useState<string>(apiToken);
  const [isPrompterOpen, setIsPrompterOpen] = useState<boolean>(false);

  useEffect(() => {
    setApiKey(apiToken);
  }, [apiToken]);

  const handleLogin = useCallback(async () => {
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
      setDisplayName(data.user.DisplayName);
      setDomain(data.user.Domain);
      setAvailableDomains(data.domains);

      router.push("/dashboard");
    } catch (error: any) {
      console.log(error)
      toast.error(error.message);
      setApiKey("");
    }
  }, [apiKey, router, setDisplayName, setDomain, setToken, setAvailableDomains]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0c0e]">
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
          <div className="mt-4 text-gray-400">A free ShareX host where you can put screenshots, images, gifs, and more.</div>
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