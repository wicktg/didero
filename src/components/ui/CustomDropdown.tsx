import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: number | string;
  label: string;
  sublabel?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: number | string;
  onChange: (value: any) => void;
  className?: string;
  label?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  className = "",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative select-none ${className}`}>
      {label && (
        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-black mb-1">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white hover:bg-neutral-50 border-[1.5px] border-black rounded-md text-xs font-bold text-black flex items-center justify-between gap-2 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="uppercase tracking-wide">
            {selectedOption?.label}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-[10px] text-neutral-600 font-bold tabular-nums">
              ({selectedOption.sublabel})
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-black shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border-[1.5px] border-black rounded-md shadow-xs z-50 max-h-48 overflow-y-auto divide-y divide-neutral-200">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                opt.value === value
                  ? "bg-[#c9daf8] text-black"
                  : "bg-white hover:bg-neutral-100 text-black"
              }`}
            >
              <span className="uppercase tracking-wide">{opt.label}</span>
              {opt.sublabel && (
                <span className="text-[10px] text-neutral-600 font-bold tabular-nums">
                  {opt.sublabel}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
