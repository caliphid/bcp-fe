"use client";
import React from "react";
import AsyncSelect from "react-select/async";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AsyncSearchableSelectProps {
  value?: string | number;
  defaultLabel?: string;
  onChange?: (e: { target: { name?: string; value: string }; option?: any }) => void;
  loadOptions: (inputValue: string) => Promise<{ value: string; label: string }[]>;
  defaultOptions?: { value: string; label: string }[] | boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  cacheOptions?: boolean;
}

export const AsyncSearchableSelect = React.forwardRef<any, AsyncSearchableSelectProps>(
  ({ value, defaultLabel, onChange, loadOptions, defaultOptions = true, disabled, className, id, name, required, placeholder, cacheOptions, ...props }, ref) => {
    
    // We need to fetch the initial label if value is provided and we only have the ID.
    // However, react-select AsyncSelect handles `value` as an object { value, label }.
    // If the parent only passes string `value`, we don't have the label unless it's in defaultOptions.
    // For simplicity, we assume the parent passes the selected Option object if they want it to show properly,
    // OR we just use a hack: if it's a string value, we just show the string as label, or rely on parent to handle it.
    // Wait, let's just make the value accept the { value, label } object for AsyncSelect, 
    // or let the parent fetch it. Actually, `onChange` expects an event.

    // Keep track of the last controlled value to avoid race conditions
    const [lastValue, setLastValue] = React.useState<string | number | undefined>(value);

    // We need to fetch the initial label if value is provided and we only have the ID.
    const [selectedOption, setSelectedOption] = React.useState<{value: string, label: string} | null>(() => {
      if (!value) return null;
      if (Array.isArray(defaultOptions)) {
        return defaultOptions.find(opt => String(opt.value) === String(value)) || { value: String(value), label: defaultLabel || String(value) };
      }
      return { value: String(value), label: defaultLabel || String(value) };
    });

    React.useEffect(() => {
      // Sync from outside
      if (value !== lastValue) {
        setLastValue(value);
        if (!value) {
          setSelectedOption(null);
        } else if (Array.isArray(defaultOptions)) {
          const match = defaultOptions.find(opt => String(opt.value) === String(value));
          setSelectedOption(match || { value: String(value), label: defaultLabel || String(value) });
        } else {
          setSelectedOption({ value: String(value), label: defaultLabel || String(value) });
        }
      } else if (value && selectedOption?.label === String(value) && defaultLabel && defaultLabel !== String(value)) {
        // Aggressively update label if it's stuck on UUID but we have a defaultLabel
        setSelectedOption({ value: String(value), label: defaultLabel });
      }
    }, [value, defaultOptions, lastValue, defaultLabel, selectedOption]);

    return (
      <AsyncSelect
        ref={ref as any}
        inputId={id}
        name={name}
        value={selectedOption}
        onChange={(opt: any) => {
          setSelectedOption(opt || null);
          setLastValue(opt ? opt.value : "");
          onChange?.({ target: { name, value: opt ? opt.value : "" }, option: opt || null });
        }}
        loadOptions={loadOptions}
        defaultOptions={defaultOptions}
        cacheOptions={cacheOptions}
        isDisabled={disabled}
        isClearable
        placeholder={placeholder || "-- Select --"}
        unstyled
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
        menuShouldBlockScroll={false}
        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
        className={cn(className, "border-0 border-transparent bg-transparent !p-0 shadow-none ring-0 outline-none focus:ring-0 focus:border-transparent h-auto m-0")}
        classNames={{
          control: (state) => cn(
            "flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm transition-colors cursor-pointer",
            state.isFocused ? "outline-none ring-2 ring-primary-500/20 border-primary-500" : "border-slate-200 hover:border-slate-300",
            state.isDisabled ? "opacity-50 cursor-not-allowed bg-slate-50" : ""
          ),
          menu: () => "bg-white border border-slate-200 rounded-xl shadow-lg mt-1 text-sm z-50 overflow-hidden absolute w-full",
          option: (state) => cn(
            "px-3 py-2.5 cursor-pointer text-slate-700 transition-colors",
            state.isFocused ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50",
            state.isSelected ? "bg-primary-50 text-primary-700 font-medium" : ""
          ),
          singleValue: () => "text-slate-900",
          placeholder: () => "text-slate-500",
          valueContainer: () => "flex gap-1",
          input: () => "m-0 p-0 text-slate-900",
          indicatorsContainer: () => "flex items-center gap-1 text-slate-400",
          dropdownIndicator: (state) => cn("p-1 hover:text-slate-600 cursor-pointer transition-transform", state.selectProps.menuIsOpen ? "rotate-180" : ""),
          clearIndicator: () => "p-1 hover:text-red-500 cursor-pointer",
          noOptionsMessage: () => "px-3 py-4 text-center text-slate-500 text-sm",
          loadingIndicator: () => "p-1 text-primary-500",
          loadingMessage: () => "px-3 py-4 text-center text-slate-500 text-sm",
        }}
        {...props}
      />
    );
  }
);
AsyncSearchableSelect.displayName = "AsyncSearchableSelect";
