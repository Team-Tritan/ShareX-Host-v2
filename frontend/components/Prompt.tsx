"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, X, Terminal } from "lucide-react";

interface PrompterProps {
  title?: string;
  message?: string;
  onConfirm: (input: string) => void;
  onCancel: () => void;
}

const Prompter: React.FC<PrompterProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const [input, setInput] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onConfirm(input);
    else if (e.key === "Escape") onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(6,6,14,0.85)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-sm overflow-hidden"
        style={{
          border: "1px solid rgba(139,92,246,0.25)",
          backgroundColor: "#0a0a12",
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{
            borderBottom: "1px solid rgba(139,92,246,0.15)",
            backgroundColor: "#0f0f1a",
          }}
        >
          {/* Decorative dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.5)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(234,179,8,0.5)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgba(74,222,128,0.5)" }} />
          </div>

          <div className="flex items-center gap-2 ml-1 flex-1 min-w-0">
            <Terminal className="w-3 h-3 flex-shrink-0 text-violet-400" />
            <span className="font-mono text-xs truncate" style={{ color: "#52525b" }}>
              {title ? title.toLowerCase().replace(/\s+/g, "-") : "input-required"}
            </span>
          </div>

          <button
            onClick={onCancel}
            className="flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center transition-colors"
            style={{ color: "#52525b" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f4f4f5";
              e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#52525b";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Title + icon */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{
                border: "1px solid rgba(139,92,246,0.25)",
                backgroundColor: "rgba(139,92,246,0.1)",
              }}
            >
              <AlertCircle className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-base font-semibold tracking-tight" style={{ color: "#f4f4f5" }}>
              {title || "Input Required"}
            </h2>
          </div>

          {/* Message */}
          {message && (
            <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
              {message}
            </p>
          )}

          {/* Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter a value..."
            autoFocus
            className="w-full px-4 py-2.5 font-mono text-sm rounded-sm outline-none transition-all"
            style={{
              backgroundColor: "#06060e",
              border: "1px solid rgba(139,92,246,0.2)",
              color: "#f4f4f5",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)")}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center py-2.5 rounded-sm text-sm font-medium transition-colors"
              style={{
                border: "1px solid rgba(139,92,246,0.15)",
                backgroundColor: "transparent",
                color: "#a1a1aa",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(input)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-semibold transition-colors"
              style={{
                border: "1px solid rgba(139,92,246,0.35)",
                backgroundColor: "rgba(139,92,246,0.2)",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.28)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.2)")}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Confirm
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div
          className="px-5 py-2.5 flex items-center gap-4"
          style={{
            borderTop: "1px solid rgba(139,92,246,0.1)",
            backgroundColor: "#0f0f1a",
          }}
        >
          {[
            { key: "↵ Enter", label: "confirm" },
            { key: "Esc", label: "cancel" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd
                className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm"
                style={{
                  border: "1px solid rgba(139,92,246,0.2)",
                  backgroundColor: "rgba(139,92,246,0.08)",
                  color: "#8b5cf6",
                }}
              >
                {key}
              </kbd>
              <span className="font-mono text-[10px]" style={{ color: "#3f3f46" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Prompter;