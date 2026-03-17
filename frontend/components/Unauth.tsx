import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowRight, AlertTriangle, Terminal, Zap, Lock } from "lucide-react";

const NotAuthenticated: React.FC = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: "#06060e" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-sm overflow-hidden"
          style={{
            border: "1px solid rgba(139,92,246,0.2)",
            backgroundColor: "#0a0a12",
          }}
        >
          {/* Terminal header bar */}
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
              tritan-uploader ~ 401
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#f87171" }}>
                unauthenticated
              </span>
            </div>
          </div>

          <div className="p-8 space-y-7">
            {/* Icon + title */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="relative w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{
                    border: "1px solid rgba(139,92,246,0.3)",
                    backgroundColor: "rgba(139,92,246,0.1)",
                  }}
                >
                  <Shield className="w-5 h-5 text-violet-400" />
                  {/* Error badge */}
                  <div
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-sm flex items-center justify-center"
                    style={{
                      border: "1px solid rgba(239,68,68,0.4)",
                      backgroundColor: "rgba(239,68,68,0.15)",
                    }}
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight" style={{ color: "#f4f4f5" }}>
                    Tritan Uploader
                  </h1>
                  <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#52525b" }}>
                    Authentication Required
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Error card */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div
                className="rounded-sm p-4 space-y-2"
                style={{
                  border: "1px solid rgba(239,68,68,0.2)",
                  backgroundColor: "rgba(239,68,68,0.06)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <p className="text-sm font-semibold" style={{ color: "#fca5a5" }}>
                    Access Denied
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
                  You must be authenticated to view this page. Sign in with your API key to continue.
                </p>
              </div>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {[
                { icon: Shield, label: "Secure" },
                { icon: Zap, label: "Fast" },
                { icon: Terminal, label: "API-First" },
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
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Link href="/" className="block">
                <button
                  className="group w-full flex items-center justify-center gap-2.5 font-semibold text-sm px-5 py-3 rounded-sm transition-colors"
                  style={{
                    border: "1px solid rgba(139,92,246,0.35)",
                    backgroundColor: "rgba(139,92,246,0.2)",
                    color: "#ffffff",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.28)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.2)")
                  }
                >
                  Sign In to Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Footer strip */}
          <div
            className="px-5 py-2.5 flex items-center justify-between"
            style={{
              borderTop: "1px solid rgba(139,92,246,0.1)",
              backgroundColor: "#0f0f1a",
            }}
          >
            <span className="font-mono text-[9px]" style={{ color: "#27272a" }}>
              Powered by Tritan Internet · AS393577
            </span>
            <span className="font-mono text-[9px]" style={{ color: "#27272a" }}>
              401
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotAuthenticated;