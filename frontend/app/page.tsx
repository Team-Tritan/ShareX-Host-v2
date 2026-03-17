/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Prompter from "@/components/Prompt";
import { useUser } from "@/stores/user";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Terminal, Zap, Upload, Link2, Shield } from "lucide-react";
import { toast } from "react-hot-toast";

interface AccountResponses {
  displayName: string;
  key: string;
  domain: string;
  admin: boolean;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const apiToken = useUser((state) => state.apiToken);
  const setToken = useUser((state) => state.setToken);
  const setDomain = useUser((state) => state.setDomain);
  const setDisplayName = useUser((state) => state.setDisplayName);
  const setIsAdmin = useUser((state) => state.setIsAdmin);
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
        headers: { key: apiKey },
        method: "GET",
      });
      if (!response.ok) {
        toast.error("Invalid API key.");
        return setApiKey("");
      }
      const data: AccountResponses = await response.json();
      setToken(apiKey);
      setDisplayName(data.displayName);
      setDomain(data.domain);
      setIsAdmin(Boolean(data.admin));
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
      setApiKey("");
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, router, setDisplayName, setDomain, setToken, setIsAdmin]);

  const handleCreateKey = useCallback(async () => {
    setIsPrompterOpen(true);
  }, []);

  const handlePrompterConfirm = useCallback(
    async (displayName: string) => {
      setIsPrompterOpen(false);
      if (!displayName) return toast.error("Display name is required.");
      try {
        const response = await fetch("/api/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_name: displayName }),
        });
        if (!response.ok) return toast.error("Failed to create API key.");
        const data: AccountResponses = await response.json();
        setToken(data.key!);
        setDisplayName(displayName);
        setIsAdmin(false);
        navigator.clipboard.writeText(data.key!);
        toast.success("API key copied to clipboard. Keep it safe.");
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [setDisplayName, setToken, setIsAdmin]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06060e] p-4">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Main card */}
        <div
          className="rounded-sm overflow-hidden"
          style={{
            border: "1px solid rgba(139,92,246,0.2)",
            backgroundColor: "#0a0a12",
          }}
        >
          {/* Card header bar */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              borderBottom: "1px solid rgba(139,92,246,0.15)",
              backgroundColor: "#0f0f1a",
            }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.5)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(234,179,8,0.5)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(74,222,128,0.5)" }} />
            </div>
            <span className="font-mono text-xs ml-1" style={{ color: "#52525b" }}>
              tritan-uploader ~ auth
            </span>
          </div>

          <div className="p-8 space-y-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-sm flex items-center justify-center"
                  style={{
                    border: "1px solid rgba(139,92,246,0.3)",
                    backgroundColor: "rgba(139,92,246,0.12)",
                  }}
                >
                  <Terminal className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight" style={{ color: "#f4f4f5" }}>
                    Tritan Uploader
                  </h1>
                  <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#52525b" }}>
                    v2.0.0 / authenticated access
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
                A free ShareX host for screenshots, images, GIFs, and more. Enter your API key to continue.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex gap-2">
              {[
                { icon: Upload, label: "Upload" },
                { icon: Link2, label: "Share" },
                { icon: Shield, label: "Secure" },
                { icon: Zap, label: "Fast" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm"
                  style={{
                    border: "1px solid rgba(139,92,246,0.15)",
                    backgroundColor: "rgba(139,92,246,0.06)",
                  }}
                >
                  <Icon className="w-3 h-3 text-violet-400" />
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#a1a1aa" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* API Key input */}
            <div className="space-y-2">
              <label
                htmlFor="api-key"
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: "#71717a" }}
              >
                API Key
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showPassword ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 pr-20 font-mono text-sm rounded-sm transition-all duration-150 outline-none"
                  style={{
                    backgroundColor: "#06060e",
                    border: "1px solid rgba(139,92,246,0.2)",
                    color: "#f4f4f5",
                  }}
                  placeholder="trtn_••••••••••••••••"
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)")}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-sm transition-colors"
                    style={{ color: "#52525b" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Sign In button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2.5 font-semibold text-sm px-5 py-3 rounded-sm transition-colors"
              style={{
                border: "1px solid rgba(139,92,246,0.35)",
                backgroundColor: isLoading ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.2)",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.28)";
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.2)";
              }}
            >
              {isLoading ? (
                <>
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                    style={{ borderColor: "rgba(139,92,246,0.3)", borderTopColor: "#8b5cf6" }}
                  />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(139,92,246,0.1)" }} />
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3f3f46" }}>
                or
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(139,92,246,0.1)" }} />
            </div>

            {/* Create key */}
            <div className="text-center">
              <button
                onClick={handleCreateKey}
                className="font-mono text-xs transition-colors"
                style={{ color: "#8b5cf6" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8b5cf6")}
              >
                $ create-account --new-api-key
              </button>
            </div>
          </div>

          {/* Footer strip */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              borderTop: "1px solid rgba(139,92,246,0.1)",
              backgroundColor: "#0f0f1a",
            }}
          >
            <span className="font-mono text-[10px]" style={{ color: "#3f3f46" }}>
              Powered by Tritan Internet · AS393577
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px]" style={{ color: "#52525b" }}>
                secure
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {isPrompterOpen && (
        <Prompter
          title="Enter Display Name"
          message="Please enter a display name for your account."
          onConfirm={handlePrompterConfirm}
          onCancel={() => setIsPrompterOpen(false)}
        />
      )}
    </div>
  );
};

export default LoginPage;