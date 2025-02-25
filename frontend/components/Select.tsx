import { forwardRef } from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    choices?: string[];
    inputClassName?: string;
};

const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
    ({ className = "", type, choices, inputClassName, ...props }, ref) => {
        const defaultInputClasses =
            "flex h-10 w-full rounded-md border border-neutral-800 bg-[#171619] px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-sans";
        const fontClasses = inputClassName || "text-white";
        const commonClasses = `${defaultInputClasses} ${fontClasses} ${className}`;

        if (choices && choices.length > 0) {
            return (
                <select
                    ref={ref as React.Ref<HTMLSelectElement>}
                    className={commonClasses}
                    {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                >
                    {choices.map((choice, index) => (
                        <option key={index} value={choice}>
                            {choice}
                        </option>
                    ))}
                </select>
            );
        }
        return (
            <input
                type={type}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                className={commonClasses}
                ref={ref as React.Ref<HTMLInputElement>}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };