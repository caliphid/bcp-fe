"use client";
import React from "react";
import Select from "react-select";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SearchableSelectProps {
  value?: string | number | readonly string[];
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
}

export const SearchableSelect = React.forwardRef<any, SearchableSelectProps>(
  ({ value, onChange, disabled, className, children, id, name, required, placeholder, ...props }, ref) => {
    const options: { value: string; label: string }[] = [];
    let selectedOption = null;

    const extractOptions = (nodes: React.ReactNode) => {
      React.Children.forEach(nodes, (child) => {
        if (!React.isValidElement(child)) return;

        if (child.type === "option" || child.props?.value !== undefined) {
          if (child.props.value === "" && !placeholder) {
            placeholder = child.props.children as string;
            return;
          }

          const opt = {
            value: String(child.props.value),
            label: String(child.props.children),
          };
          options.push(opt);

          if (String(child.props.value) === String(value)) {
            selectedOption = opt;
          }
        } else if (child.props && child.props.children) {
          extractOptions(child.props.children);
        }
      });
    };

    extractOptions(children);

    return (
      <Select
        ref={ref as any}
        inputId={id}
        name={name}
        value={selectedOption}
        onChange={(opt) => onChange?.({ target: { name, value: opt ? opt.value : "" } })}
        options={options}
        isDisabled={disabled}
        isClearable
        isSearchable
        placeholder={placeholder || "-- Select --"}
        unstyled
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
        }}
        {...props}
      />
    );
  }
);
SearchableSelect.displayName = "SearchableSelect";
