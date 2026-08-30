import React from 'react';

interface HouseHotelPipsProps {
  houses: number; // 0-4 houses, 5 = hotel
  orientation?: 'top' | 'bottom' | 'left' | 'right';
}

export const HouseHotelPips: React.FC<HouseHotelPipsProps> = ({ houses, orientation = 'top' }) => {
  if (houses === 0) return null;

  if (houses === 5) {
    // Hotel
    return (
      <div className="flex items-center justify-center p-0.5">
        <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Hotel
        </span>
      </div>
    );
  }

  // 1-4 Houses
  return (
    <div className={`flex items-center justify-center gap-0.5 p-0.5 ${orientation === 'left' || orientation === 'right' ? 'flex-col' : 'flex-row'}`}>
      {Array.from({ length: houses }).map((_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-emerald-600 border border-emerald-700 rounded-sm shadow-xs flex items-center justify-center"
          title={`House ${i + 1}`}
        >
          <div className="w-1 h-1 bg-emerald-300 rounded-xs" />
        </div>
      ))}
    </div>
  );
};
