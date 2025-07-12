import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  choices?: string[];
  inputClassName?: string;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  ({ className = "", type, choices, inputClassName, label, error, icon, ...props }, ref) => {
    const baseClasses =
      "w-full px-4 py-3 bg-[#171619]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl text-white placeholder-gray-500 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const errorClasses = error 
      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50" 
      : "";
    
    const iconClasses = icon ? "pl-12" : "";
    
    const combinedClasses = `${baseClasses} ${errorClasses} ${iconClasses} ${inputClassName || ""} ${className}`;

    const selectClasses = choices && choices.length > 0 
      ? `${combinedClasses} pr-12 appearance-none cursor-pointer`
      : combinedClasses;

    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          {choices && choices.length > 0 ? (
            <>
              <select
                ref={ref as React.Ref<HTMLSelectElement>}
                className={selectClasses}
                {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
              >
                {choices.map((choice, index) => (
                  <option 
                    key={index} 
                    value={choice}
                    className="bg-[#171619] text-white py-2"
                  >
                    {choice}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </>
          ) : (
            <input
              type={type}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              className={combinedClasses}
              ref={ref as React.Ref<HTMLInputElement>}
              {...props}
            />
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };