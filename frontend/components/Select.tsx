"use client";

import { forwardRef } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  choices?: string[];
  inputClassName?: string;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  ({ className = "", type, choices, inputClassName, label, error, icon, ...props }, ref) => {
    const base: React.CSSProperties = {
      width: "100%",
      paddingTop: "0.625rem",
      paddingBottom: "0.625rem",
      paddingLeft: icon ? "2.75rem" : "1rem",
      paddingRight: choices && choices.length > 0 ? "2.75rem" : "1rem",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "0.875rem",
      color: "#f4f4f5",
      backgroundColor: "#06060e",
      border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(139,92,246,0.2)"}`,
      borderRadius: "2px",
      outline: "none",
      transition: "border-color 0.15s ease",
      appearance: choices && choices.length > 0 ? "none" : undefined,
      cursor: choices && choices.length > 0 ? "pointer" : undefined,
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = error
        ? "rgba(239,68,68,0.7)"
        : "rgba(139,92,246,0.5)";
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = error
        ? "rgba(239,68,68,0.4)"
        : "rgba(139,92,246,0.2)";
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (!(e.currentTarget as HTMLInputElement).disabled) {
        e.currentTarget.style.borderColor = error
          ? "rgba(239,68,68,0.6)"
          : "rgba(139,92,246,0.35)";
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (document.activeElement !== e.currentTarget) {
        e.currentTarget.style.borderColor = error
          ? "rgba(239,68,68,0.4)"
          : "rgba(139,92,246,0.2)";
      }
    };

    return (
      <div className={`relative ${className}`}>
        {/* Label */}
        {label && (
          <label
            className="block font-mono text-[11px] uppercase tracking-widest mb-1.5"
            style={{ color: error ? "#f87171" : "#71717a" }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Leading icon */}
          {icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#52525b" }}
            >
              {icon}
            </div>
          )}

          {choices && choices.length > 0 ? (
            <>
              <select
                ref={ref as React.Ref<HTMLSelectElement>}
                style={base}
                className={`disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName ?? ""}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
              >
                {choices.map((choice, index) => (
                  <option
                    key={index}
                    value={choice}
                    style={{ backgroundColor: "#0a0a12", color: "#f4f4f5" }}
                  >
                    {choice}
                  </option>
                ))}
              </select>
              {/* Trailing chevron */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4" style={{ color: "#52525b" }} />
              </div>
            </>
          ) : (
            <input
              type={type}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              style={base}
              className={`disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#3f3f46] ${inputClassName ?? ""}`}
              ref={ref as React.Ref<HTMLInputElement>}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              {...props}
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px]"
            style={{ color: "#f87171" }}
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };