import * as React from "react";
import { cn } from "../../lib/utils";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        // Only override displayValue if the parsed numeric value of displayValue is different from `value`, 
        // OR if displayValue is empty but value is not 0
        const currentParsed = parseInt(displayValue.replace(/\D/g, ""), 10) || 0;
        if (currentParsed !== value) {
          setDisplayValue(value === 0 ? "" : value.toLocaleString("id-ID"));
        }
      }
    }, [value, displayValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");

      if (!rawValue) {
        setDisplayValue("");
        onChange?.(0);
        return;
      }

      const numValue = parseInt(rawValue, 10);
      setDisplayValue(numValue.toLocaleString("id-ID"));
      onChange?.(numValue);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
          Rp
        </span>
        <input
          type="text"
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50",
            className
          )}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
