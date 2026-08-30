import React from "react";
import { Plus, Minus } from "lucide-react";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  prefix?: string;
  className?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 10,
  label,
  prefix = "$",
  className = "",
}) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  return (
    <div className={`flex flex-col gap-1 select-none ${className}`}>
      {label && (
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-black">
          {label}
        </span>
      )}
      <div className="flex items-center bg-white border-[1.5px] border-black rounded-md overflow-hidden">
        {/* Decrement (-) Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="p-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-black border-r-[1.5px] border-black transition-colors flex items-center justify-center shrink-0 active:bg-neutral-300"
          title="Decrease amount"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Display & Text Input */}
        <div className="flex-1 px-2 py-1 flex items-center justify-center bg-white">
          <span className="text-xs font-black text-black tabular-nums">
            {prefix}
            {value}
          </span>
        </div>

        {/* Increment (+) Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="p-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-black border-l-[1.5px] border-black transition-colors flex items-center justify-center shrink-0 active:bg-neutral-300"
          title="Increase amount"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
