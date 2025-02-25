import React, { useState } from "react";

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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#121114] p-6 rounded-xl shadow-md max-w-sm w-full">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        {message && <p className="text-gray-300 mb-4">{message}</p>}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a value"
          className="w-full px-3 py-2 mb-4 border-2 border-purple-500 rounded-md bg-[#1a1a1d] text-white focus:outline-none focus:border-purple-600"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(input)}
            className="px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Prompter;
