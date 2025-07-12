import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, X } from "lucide-react";

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
    if (e.key === 'Enter') {
      onConfirm(input);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-[#171619]/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full border border-zinc-800/50 shadow-2xl"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-full">
            <AlertCircle className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {title || "Input Required"}
            </h2>
          </div>
        </div>

        {message && (
          <p className="text-gray-400 mb-6 leading-relaxed">
            {message}
          </p>
        )}

        <div className="mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a value"
            className="w-full px-4 py-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-zinc-800/80 backdrop-blur-sm border border-zinc-600/50 rounded-xl text-white hover:bg-zinc-700/80 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={() => onConfirm(input)}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl text-white font-medium hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm
          </motion.button>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
      </motion.div>
    </motion.div>
  );
};

export default Prompter;