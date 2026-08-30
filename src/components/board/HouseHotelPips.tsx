import React from "react";

interface HouseHotelPipsProps {
  houses: number;
  orientation?: "top" | "bottom" | "left" | "right";
}

export const HouseHotelPips: React.FC<HouseHotelPipsProps> = ({
  houses,
  orientation = "top",
}) => {
  if (houses === 0) return null;

  if (houses === 5) {
    return (
      <div className="flex items-center justify-center p-0.5">
        <span className="bg-[#eb1c24] text-white text-[8px] font-extrabold px-1.5 py-px rounded-xs border border-black uppercase tracking-wide">
          H
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-0.5 p-0.5 ${
        orientation === "left" || orientation === "right"
          ? "flex-col"
          : "flex-row"
      }`}
    >
      {Array.from({ length: houses }).map((_, i) => (
        <div
          key={i}
          className="w-[7px] h-[7px] bg-[#a5cd39] border border-black rounded-xs"
          title={`House ${i + 1}`}
        />
      ))}
    </div>
  );
};
